import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const apiUrl = process.env.REACT_APP_API_URL;


export default function ChatbotPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      text: "Hello! Ask me to generate code or explain concepts.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState(""); // For storing explanation from Gemini
  const [code, setCode] = useState(""); // For storing code from Gemini
  const [resources, setResources] = useState(""); // For storing resources from Gemini
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear the input field
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const { explanation, code, resources } = data; // Ensure resources are destructured

      // Remove unwanted `---\n\n` from the explanation
      const cleanedExplanation = explanation.replace(/---\n\n/g, "").trim();

      // Split the cleaned explanation into chunks and display them with a slight delay
      const explanationChunks = cleanedExplanation.split("\n"); // assuming explanation is in paragraphs or newlines
      for (let i = 0; i < explanationChunks.length; i++) {
        const chunk = explanationChunks[i];
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { text: chunk, sender: "bot", timestamp: new Date() },
          ]);
        }, 1500 * i); // Add a delay of 1.5 seconds between chunks
      }

      setExplanation(cleanedExplanation);
      setCode(code);
      setResources(resources); // Update resources state
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm having trouble responding. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript); // Set the captured voice input into the text input field
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  };

  // Track if speech is already being spoken
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Function to start or stop speaking text (chatbot explanation or code)
  const toggleSpeech = (text) => {
    if (isSpeaking) {
      // If speech is currently playing, stop it
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // If speech is not playing, start it
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = "en-US";
      speech.rate = 1;
      speech.pitch = 1;
      speech.onend = () => setIsSpeaking(false); // When speech ends, set speaking state to false
      window.speechSynthesis.speak(speech);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="container">
      {/* Chatbot Section (Left 30%) */}
      <div className="chatbot-container">
        <header className="chatbot-header">
          <button onClick={handleBack} className="logout-button">
            ← Back
          </button>
          <h2>Chatbot</h2>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </header>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.sender === "user" ? "user-message" : "bot-message"
              } ${
                index === messages.length - 1 && isLoading ? "thinking" : ""
              }`}
            >
              <div className="message-content">
                <div>
                  {message.text
                    .split("\n")
                    .filter((line) => line.trim() !== "")
                    .map((line, idx) => {
                      const match = line.match(/\[(.*?)\]\((.*?)\)/);
                      if (match) {
                        const [_, title, link] = match;
                        return (
                          <div key={idx} style={{ marginBottom: "8px" }}>
                            <h4 style={{ margin: "4px 0" }}>{title}</h4>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#007bff" }}
                            >
                              {link}
                            </a>
                          </div>
                        );
                      } else {
                        return (
                          <p
                            key={idx}
                            style={{ marginBottom: "8px", lineHeight: "1.5" }}
                          >
                            {line}
                          </p>
                        );
                      }
                    })}
                </div>

                {!isLoading && (
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message thinking">
              <div className="message-content">
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

        <div className="chat-input-container">
          <input
            type="text"
            placeholder="Ask a question or talk..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
          {/* Voice Input Button */}
          <button
            onClick={handleVoiceInput}
            disabled={isLoading}
            className="voice-input-button"
          >
            🎙️
          </button>
        </div>

        {/* Speaker Buttons */}
        <div className="speaker-buttons">
          <button
            onClick={() => toggleSpeech(explanation)}
            disabled={isLoading}
            className="speaker-button"
          >
            🎤 Read Explanation
          </button>
          <button
            onClick={() => toggleSpeech(code)}
            disabled={isLoading}
            className="speaker-button"
          >
            🎤 Read Code
          </button>
        </div>
      </div>

      {/* Code Editor Section (Right 70%) */}
      <div className="editor-container" style={{ width: "60%" }}>
        <h3>Generated Code</h3>
        <pre className="code-editor">{code}</pre>
      </div>

      {/* Resources Section (Right 30%) */}
      {/* Resources Section (Right 30%) */}
      <div className="resources-container" style={{ width: "30%" , overflow:"hidden"}}>
        <h3>Related Resources</h3>
        {resources ? (
          <div className="resources-content">
            {resources
              .trim()
              .split("\n")
              .filter((line) => line.startsWith("-"))
              .map((item, index) => {
                const match = item.match(/\[(.*?)\]\((.*?)\)/);
                if (!match) return null;
                const [_, title, link] = match;
                return (
                  <div
                    key={index}
                    className="resource-item"
                    style={{ marginBottom: "10px" }}
                  >
                    <h4 style={{ margin: "5px 0" }}>{title}</h4>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#007bff" }}
                    >
                      {link}
                    </a>
                  </div>
                );
              })}
          </div>
        ) : (
          <p>No resources available at the moment.</p>
        )}
      </div>
    </div>
  );
}
