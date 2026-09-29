import React, { useState, useEffect } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { LoginScreen } from './pages/LoginScreen';
import { ParentRegistrationScreen } from './pages/ParentRegistrationScreen';
import { LanguageSelectionScreen } from './pages/LanguageSelectionScreen';
import { AddChildScreen } from './pages/AddChildScreen';
import { SchoolSelectionScreen } from './pages/SchoolSelectionScreen';
import { ChildVerificationScreen } from './pages/ChildVerificationScreen';
import { SchoolSathiIntroScreen } from './pages/SchoolSathiIntroScreen';
import { MainCompanionScreen } from './pages/MainCompanionScreen';
import { ChildProfileScreen } from './pages/ChildProfileScreen';
import { SettingsScreen } from './pages/SettingsScreen';
import { HelpScreen } from './pages/HelpScreen';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ScreenId, LanguageCode, Child, School, Parent, AvatarPersona } from './types';
import { MOCK_SCHOOLS, MOCK_PARENTS } from './data/mockData';
import { AuthService } from './services/authService';
import { StudentService } from './services/studentService';

export function App() {
  // Initialize authenticated parent from persisted session or default
  const [parent, setParent] = useState<Parent>(() => {
    return AuthService.getCurrentParent() || MOCK_PARENTS[0];
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      return 'admin';
    }
    return 'welcome';
  });
  const [language, setLanguage] = useState<LanguageCode>(() => parent.preferredLanguage || 'hi');
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School>(MOCK_SCHOOLS[0]);
  const [voiceSpeed, setVoiceSpeed] = useState<'slow' | 'normal' | 'fast'>(() => (parent.voiceSpeed as any) || 'normal');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState<boolean>(() => parent.autoDetectLanguage ?? true);
  const [avatarPersona, setAvatarPersona] = useState<AvatarPersona>(() => parent.avatarPersona || 'auto');

  // Strictly load children for this parent account (Access Control / Data Isolation)
  const [students, setStudents] = useState<Child[]>(() => {
    return StudentService.getChildrenForParent(parent.id);
  });

  // Active child selector ID ('all' for multi-child questions, or individual child ID)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return students[0]?.id || 'all';
  });

  // Whenever the active parent changes, reload their children only
  useEffect(() => {
    const parentChildren = StudentService.getChildrenForParent(parent.id);
    setStudents(parentChildren);
    if (parentChildren.length > 0) {
      setSelectedStudentId(parentChildren[0].id);
    } else {
      setSelectedStudentId('all');
    }
    if (parent.preferredLanguage) {
      setLanguage(parent.preferredLanguage);
    }
    if (parent.autoDetectLanguage !== undefined) {
      setAutoDetectLanguage(parent.autoDetectLanguage);
    }
    if (parent.voiceSpeed) {
      setVoiceSpeed(parent.voiceSpeed);
    }
    if (parent.avatarPersona) {
      setAvatarPersona(parent.avatarPersona);
    }
  }, [parent.id]);

  const handleToggleAutoDetectLanguage = () => {
    const next = !autoDetectLanguage;
    setAutoDetectLanguage(next);
    AuthService.updateParentProfile(parent.id, { autoDetectLanguage: next });
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    AuthService.updateParentProfile(parent.id, { preferredLanguage: lang });
  };

  const handleVoiceSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    setVoiceSpeed(speed);
    AuthService.updateParentProfile(parent.id, { voiceSpeed: speed });
  };

  const handleAvatarPersonaChange = (persona: AvatarPersona) => {
    setAvatarPersona(persona);
    AuthService.updateParentProfile(parent.id, { avatarPersona: persona });
  };

  // Current active student
  const currentStudent =
    students.find((s) => s.id === selectedStudentId) || (students.length > 0 ? students[0] : null);

  // Login handler
  const handleLoginSuccess = (loggedInParent: Parent) => {
    setParent(loggedInParent);
    const parentChildren = StudentService.getChildrenForParent(loggedInParent.id);
    setStudents(parentChildren);
    setSelectedStudentId(parentChildren[0]?.id || 'all');
    setCurrentScreen('main-companion');
  };

  // Logout handler
  const handleLogout = () => {
    AuthService.logout();
    setParent(MOCK_PARENTS[0]); // Reset to default
    setCurrentScreen('welcome');
  };

  // Switch Account handler (for testing data isolation)
  const handleSwitchAccount = (newParent: Parent) => {
    AuthService.setSession(newParent);
    setParent(newParent);
    const parentChildren = StudentService.getChildrenForParent(newParent.id);
    setStudents(parentChildren);
    setSelectedStudentId(parentChildren[0]?.id || 'all');
  };

  // Verification success handler
  const handleVerificationSuccess = (verifiedChild: Child) => {
    const updatedParent = AuthService.getCurrentParent() || parent;
    setParent(updatedParent);
    const updated = StudentService.getChildrenForParent(parent.id);
    setStudents(updated);
    setSelectedStudentId(verifiedChild.id);
    setCurrentScreen('main-companion');
  };

  // Unlink child handler
  const handleUnlinkChild = (childId: string) => {
    const updatedParent = AuthService.unlinkChild(parent.id, childId);
    setParent(updatedParent);
    const updatedChildren = StudentService.getChildrenForParent(parent.id);
    setStudents(updatedChildren);
    setSelectedStudentId(updatedChildren[0]?.id || 'all');
  };

  // Handler for manual add child (Task 4: Immediately appear in UI, selectable, available to AI, persists)
  const handleSaveChild = (childData: Partial<Child>) => {
    const newChild = StudentService.addManualChild(parent.id, {
      ...childData,
      schoolId: selectedSchool?.id || 'sch-demo',
      schoolName: childData.schoolName || selectedSchool?.name || 'SchoolSathi Demo School',
    });
    const updatedParent = AuthService.getCurrentParent() || parent;
    setParent(updatedParent);
    const updatedChildren = StudentService.getChildrenForParent(parent.id);
    setStudents(updatedChildren);
    setSelectedStudentId(newChild.id);
    setCurrentScreen('main-companion');
  };

  const handleSaveParentDetails = (name: string, phone: string, relation: any) => {
    const updated = AuthService.updateParentProfile(parent.id, {
      name,
      fullName: name,
      mobile: phone,
      phoneNumber: phone,
      relationship: relation,
    });
    setParent(updated);
  };

  if (currentScreen === 'admin') {
    return (
      <AdminDashboard
        onNavigateToParentApp={() => {
          const updatedChildren = StudentService.getChildrenForParent(parent.id);
          setStudents(updatedChildren);
          setCurrentScreen('main-companion');
        }}
        onNavigate={setCurrentScreen}
      />
    );
  }

  return (
    <AppLayout
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      language={language}
      onSelectLanguage={(lang) => {
        setLanguage(lang);
        AuthService.updateParentProfile(parent.id, { preferredLanguage: lang });
      }}
      isLangModalOpen={isLangModalOpen}
      onOpenLangModal={() => setIsLangModalOpen(true)}
      onCloseLangModal={() => setIsLangModalOpen(false)}
      parentName={parent.name}
    >
      {/* 1. Welcome Screen */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen language={language} onNavigate={setCurrentScreen} />
      )}

      {/* 2. Login Screen (Mobile & OTP) */}
      {currentScreen === 'login' && (
        <LoginScreen
          language={language}
          onNavigate={setCurrentScreen}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* 3. Parent Registration Screen */}
      {currentScreen === 'register' && (
        <ParentRegistrationScreen
          language={language}
          onNavigate={setCurrentScreen}
          onSaveParentDetails={handleSaveParentDetails}
        />
      )}

      {/* 4. Language Selection */}
      {currentScreen === 'language' && (
        <LanguageSelectionScreen
          currentLanguage={language}
          onSelectLanguage={(l) => {
            setLanguage(l);
            AuthService.updateParentProfile(parent.id, { preferredLanguage: l });
          }}
          onNavigate={setCurrentScreen}
        />
      )}

      {/* 5. School Selection */}
      {currentScreen === 'select-school' && (
        <SchoolSelectionScreen
          language={language}
          onNavigate={setCurrentScreen}
          onSelectSchool={setSelectedSchool}
        />
      )}

      {/* 6. Add Child Form */}
      {currentScreen === 'add-child' && (
        <AddChildScreen
          language={language}
          selectedSchool={selectedSchool}
          onNavigate={setCurrentScreen}
          onSaveChild={handleSaveChild}
          existingChildrenCount={students.length}
        />
      )}

      {/* 7. Child Verification with Official School Records */}
      {currentScreen === 'verify-child' && (
        <ChildVerificationScreen
          language={language}
          selectedSchool={selectedSchool}
          currentParentId={parent.id}
          onNavigate={setCurrentScreen}
          onVerificationSuccess={handleVerificationSuccess}
        />
      )}

      {/* 7.5 SchoolSathi Companion Introduction */}
      {currentScreen === 'intro' && (
        <SchoolSathiIntroScreen
          language={language}
          onNavigate={setCurrentScreen}
          student={currentStudent}
          parentName={parent.name.split(' ')[0]}
          avatarPersona={avatarPersona}
        />
      )}

      {/* 8. Main AI Voice Companion (The Core Screen) */}
      {currentScreen === 'main-companion' && (
        <MainCompanionScreen
          students={students}
          currentStudent={currentStudent}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          language={language}
          onOpenLanguageModal={() => setIsLangModalOpen(true)}
          onNavigate={setCurrentScreen}
          parentName={parent.name.split(' ')[0] + ' ji'}
          voiceSpeed={voiceSpeed}
          onChangeVoiceSpeed={handleVoiceSpeedChange}
          autoDetectLanguage={autoDetectLanguage}
          onToggleAutoDetectLanguage={handleToggleAutoDetectLanguage}
          onLanguageChange={handleLanguageChange}
          avatarPersona={avatarPersona}
          onChangeAvatarPersona={handleAvatarPersonaChange}
        />
      )}

      {/* 9. Child Profile */}
      {currentScreen === 'child-profile' && (
        <ChildProfileScreen
          students={students}
          currentStudent={currentStudent}
          onSelectStudent={setSelectedStudentId}
          language={language}
          onNavigate={setCurrentScreen}
        />
      )}

      {/* 10. Settings & Account Management */}
      {currentScreen === 'settings' && (
        <SettingsScreen
          language={language}
          onOpenLanguageModal={() => setIsLangModalOpen(true)}
          onSelectLanguage={handleLanguageChange}
          voiceSpeed={voiceSpeed}
          onChangeVoiceSpeed={handleVoiceSpeedChange}
          autoSpeak={autoSpeak}
          onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
          autoDetectLanguage={autoDetectLanguage}
          onToggleAutoDetectLanguage={handleToggleAutoDetectLanguage}
          avatarPersona={avatarPersona}
          onChangeAvatarPersona={handleAvatarPersonaChange}
          students={students}
          onNavigate={setCurrentScreen}
          parent={parent}
          onLogout={handleLogout}
          onUnlinkChild={handleUnlinkChild}
          onSwitchAccount={handleSwitchAccount}
        />
      )}

      {/* 11. Help & Voice Guide */}
      {currentScreen === 'help' && (
        <HelpScreen language={language} onNavigate={setCurrentScreen} />
      )}
    </AppLayout>
  );
}

export default App;
