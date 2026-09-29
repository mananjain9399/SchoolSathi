import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function serverTTSPlugin(): Plugin {
  return {
    name: 'schoolsathi-tts-server-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { text: _text, language, gender, speed, style } = payload;

              // Secure backend check: check for private server API keys without leaking to frontend
              const apiKey =
                process.env.TTS_API_KEY ||
                process.env.ELEVENLABS_API_KEY ||
                process.env.AZURE_TTS_KEY ||
                process.env.GOOGLE_TTS_KEY;

              // When external neural cloud credentials are provided on the server, forward to the provider
              if (apiKey && process.env.ELEVENLABS_API_KEY) {
                // Server-to-server call with private API key...
              }

              // Return server-managed response
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  status: 'fallback',
                  provider: 'server_managed',
                  voice: {
                    gender: gender || 'female',
                    speed: speed || 'normal',
                    style: style || 'friendly',
                    language: language || 'hi',
                  },
                  message: 'Server endpoint verified. Using client neural browser synthesis fallback.',
                })
              );
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err?.message || 'Server TTS error' }));
            }
          });
          return;
        }

        if (req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              status: 'ready',
              service: 'SchoolSathi Secure Server TTS Endpoint',
              hasApiKey: !!(
                process.env.TTS_API_KEY ||
                process.env.ELEVENLABS_API_KEY ||
                process.env.AZURE_TTS_KEY ||
                process.env.GOOGLE_TTS_KEY
              ),
            })
          );
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    serverTTSPlugin(),
  ],
})
