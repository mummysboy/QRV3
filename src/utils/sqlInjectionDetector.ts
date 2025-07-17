// SQL Injection Detection Utility
export const detectSQLInjection = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  const sqlPatterns = [
    // Common SQL keywords and patterns
    /\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick)\b/i,
    // SQL injection patterns
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
    // Comment patterns
    /--|#|\/\*|\*\//,
    // Quote patterns
    /'|"|`/,
    // Semicolon patterns
    /;/,
    // OR/AND patterns
    /\b(or|and)\b\s+\d+\s*=\s*\d+/i,
    // UNION patterns
    /\bunion\b.*\bselect\b/i,
    // DROP patterns
    /\bdrop\b.*\btable\b/i,
    // INSERT patterns
    /\binsert\b.*\binto\b/i,
    // UPDATE patterns
    /\bupdate\b.*\bset\b/i,
    // DELETE patterns
    /\bdelete\b.*\bfrom\b/i,
    // Script injection patterns
    /<script|javascript:|vbscript:|onload=|onerror=|onclick=/i,
    // XSS patterns
    /<iframe|<object|<embed|<form|<input|<textarea|<button|<select|<option/i,
    // Meta refresh redirect
    /<meta.*refresh/i,
    // Base64 encoded patterns
    /data:text\/html|data:application\/javascript/i,
    // URL encoding patterns
    /%3cscript|%3ciframe|%3cobject|%3cembed/i,
    // Hex encoded patterns
    /\\x3cscript|\\x3ciframe|\\x3cobject|\\x3cembed/i,
    // Unicode encoded patterns
    /\\u003cscript|\\u003ciframe|\\u003cobject|\\u003cembed/i
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

export const showSQLInjectionPopup = (): void => {
  // Create popup overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-family: Arial, sans-serif;
  `;

  // Create popup content
  const popup = document.createElement('div');
  popup.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    max-width: 400px;
    margin: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: popupAppear 0.3s ease-out;
  `;

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes popupAppear {
      from {
        opacity: 0;
        transform: scale(0.8) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `;
  document.head.appendChild(style);

  // Popup content
  popup.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 20px;">😤</div>
    <h2 style="color: #e74c3c; margin-bottom: 15px; font-size: 24px;">Your mummy would not be proud</h2>
    <p style="color: #666; margin-bottom: 20px; font-size: 16px; line-height: 1.5;">
      We detected some suspicious activity. Redirecting you to a place where you can reflect on your choices...
    </p>
    <div style="font-size: 20px; color: #3498db;">Redirecting in 3 seconds...</div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Redirect after 3 seconds
  setTimeout(() => {
    window.location.href = 'https://www.youneedjesus.com';
  }, 3000);
}; 