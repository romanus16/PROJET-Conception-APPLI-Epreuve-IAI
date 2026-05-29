import React, { useState, useRef, useEffect } from 'react'
import { iaAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function AssistantIA() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Bonjour ! 👋 Je suis l\'assistant IA de l\'IAI Togo. Je peux vous aider à trouver des informations sur les filières, les matières, les ressources pédagogiques, les stages, etc. Comment puis-je vous aider aujourd\'hui ?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await iaAPI.ask(userMessage)
      if (response.data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.data.response 
        }])
      } else {
        const errorMsg = response.data.message || 'Une erreur s\'est produite'
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `⚠️ ${errorMsg}` 
        }])
      }
    } catch (error) {
      console.error('Erreur IA:', error)
      let errorMessage = 'Désolé, une erreur de connexion s\'est produite.'
      
      if (error.response) {
        if (error.response.status === 500) {
          errorMessage = '⚠️ Erreur du serveur IA. Veuillez contacter l\'administrateur.'
        } else if (error.response.status === 504) {
          errorMessage = '⏰ Délai d\'attente dépassé. Veuillez réessayer.'
        } else if (error.response.data?.message) {
          errorMessage = `⚠️ ${error.response.data.message}`
        }
      } else if (error.request) {
        errorMessage = '📡 Impossible de joindre le serveur. Vérifiez votre connexion.'
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const quickQuestions = [
    'Comment uploader une ressource ?',
    'Quelles sont les filières disponibles ?',
    'Comment valider un document de stage ?',
    'Où trouver les cours de ma filière ?',
  ]

  return (
    <div className="assistant-container">
      {/* Header avec dégradé */}
      <div className="assistant-header">
        <div className="header-content">
          <div className="ai-icon-wrapper">
            <span className="ai-icon">🤖</span>
            <div className="ai-status"></div>
          </div>
          <div>
            <h1 className="header-title">Assistant IA</h1>
            <p className="header-subtitle">
              Posez vos questions sur les cours, ressources, stages, etc.
            </p>
          </div>
        </div>
        <div className="header-badge">
          <span className="badge-text">GPT-4 Mini</span>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
          >
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-bubble">
              <div className="message-text">{msg.content}</div>
              <div className="message-time">
                {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message message-assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div className="quick-questions">
          <p className="quick-title">💡 Questions rapides :</p>
          <div className="quick-buttons">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInput(q)}
                className="quick-button"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            disabled={isLoading}
            className="input-field"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`send-button ${isLoading || !input.trim() ? 'disabled' : ''}`}
          >
            {isLoading ? (
              <span className="spinner-small"></span>
            ) : (
              <span>Envoyer</span>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .assistant-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 120px);
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          background: var(--bg-page);
        }

        .assistant-header {
          background: linear-gradient(135deg, var(--orange) 0%, #ea580c 100%);
          border-radius: var(--radius-xl);
          padding: 24px 28px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.2);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ai-icon-wrapper {
          position: relative;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          border-radius: var(--radius);
          font-size: 28px;
        }

        .ai-status {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          background: #22c55e;
          border: 2px solid var(--orange);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .header-title {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 4px 0;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .header-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
        }

        .header-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 6px 14px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .badge-text {
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 16px;
          padding-right: 8px;
          padding-bottom: 8px;
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: var(--gray-200);
          border-radius: 3px;
        }

        .message {
          display: flex;
          gap: 12px;
          max-width: 85%;
          animation: fadeInUp 0.3s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-assistant {
          align-self: flex-start;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          background: var(--bg-card);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .message-user .message-avatar {
          background: var(--navy);
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: var(--radius);
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
          white-space: pre-wrap;
          position: relative;
        }

        .message-user .message-bubble {
          background: var(--orange);
          color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 2px 12px rgba(249, 115, 22, 0.2);
        }

        .message-assistant .message-bubble {
          background: var(--bg-card);
          color: var(--gray-800);
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .message-time {
          font-size: 10px;
          opacity: 0.6;
          margin-top: 6px;
          text-align: right;
        }

        .message-user .message-time {
          color: rgba(255,255,255,0.7);
        }

        .quick-questions {
          margin-bottom: 16px;
          padding: 16px;
          background: var(--bg-card);
          border-radius: var(--radius);
          border: 1px solid var(--gray-100);
        }

        .quick-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-600);
          margin-bottom: 10px;
        }

        .quick-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .quick-button {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1.5px solid var(--gray-200);
          background: transparent;
          color: var(--gray-700);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-button:hover {
          border-color: var(--orange);
          color: var(--orange);
          background: rgba(249, 115, 22, 0.05);
          transform: translateY(-1px);
        }

        .input-container {
          padding-top: 16px;
          border-top: 1px solid var(--gray-100);
        }

        .input-wrapper {
          display: flex;
          gap: 12px;
          background: var(--bg-card);
          padding: 8px;
          border-radius: var(--radius-xl);
          border: 1.5px solid var(--gray-200);
          transition: border-color 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: var(--orange);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .input-field {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: transparent;
          color: var(--gray-800);
          font-size: 14px;
          outline: none;
        }

        .input-field::placeholder {
          color: var(--gray-400);
        }

        .send-button {
          padding: 10px 24px;
          border-radius: var(--radius);
          border: none;
          background: var(--orange);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .send-button:hover:not(.disabled) {
          background: #ea580c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }

        .send-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: var(--gray-400);
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}