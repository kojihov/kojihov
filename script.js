document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const DEFAULT_MODEL = 'deepseek-chat';
    const MAX_TOKENS = 4096;
    
    const chatContainer = document.getElementById('chat-container');
    const messagesDiv = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const apiKeyInput = document.getElementById('api-key');
    const saveKeyBtn = document.getElementById('save-key');
    const clearBtn = document.getElementById('clear-btn');
    const exportBtn = document.getElementById('export-btn');
    const statusDiv = document.getElementById('status');
    
    // Загрузка сохраненного API ключа
    const savedApiKey = localStorage.getItem('deepseekApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
    
    // Сохранение API ключа
    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('deepseekApiKey', key);
            showStatus('Ключ сохранен!', 'success');
        } else {
            showStatus('Введите API ключ', 'error');
        }
    });
    
    // Отправка сообщения
    async function sendMessage() {
        const message = userInput.value.trim();
        const apiKey = localStorage.getItem('deepseekApiKey');
        
        if (!message) {
            showStatus('Введите сообщение', 'warning');
            return;
        }
        
        if (!apiKey) {
            showStatus('Введите и сохраните API ключ!', 'error');
            return;
        }
        
        // Добавление сообщения пользователя
        addMessage(message, 'user');
        userInput.value = '';
        showStatus('Генерация ответа...', 'processing');
        
        // Показать индикатор печати
        showTypingIndicator();
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: DEFAULT_MODEL,
                    messages: [{ role: 'user', content: message }],
                    max_tokens: MAX_TOKENS,
                    stream: false
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Ошибка API: ${response.status}`);
            }
            
            const data = await response.json();
            const botResponse = data.choices[0].message.content;
            
            // Удалить индикатор печати и добавить ответ
            removeTypingIndicator();
            addMessage(botResponse, 'bot');
            showStatus('Готов к работе', 'ready');
            
            // Подсветка кода
            setTimeout(() => {
                document.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            }, 100);
            
        } catch (error) {
            console.error('Ошибка:', error);
            removeTypingIndicator();
            addMessage(`⚠️ Ошибка: ${error.message}`, 'bot');
            showStatus('Ошибка запроса', 'error');
        }
    }
    
    // Добавление сообщения в чат
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // Форматирование блоков кода
        let formattedContent = content;
        formattedContent = formattedContent.replace(/```(\w+)?\s*([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
        formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        messageDiv.innerHTML = formattedContent;
        messagesDiv.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Показать индикатор печати
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('message', 'bot-message');
        
        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingContent.appendChild(dot);
        }
        
        typingDiv.appendChild(typingContent);
        messagesDiv.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Удалить индикатор печати
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Очистка чата
    clearBtn.addEventListener('click', () => {
        messagesDiv.innerHTML = '';
        showStatus('Чат очищен', 'success');
    });
    
    // Экспорт чата
    exportBtn.addEventListener('click', () => {
        const chatContent = Array.from(messagesDiv.querySelectorAll('.message'))
            .map(msg => {
                const sender = msg.classList.contains('user-message') ? 'Вы' : 'Ты — технический эксперт, создающий структурированные ответы. Строго соблюдай правила:
1️⃣ **Структура:**  
   • Заголовок темы → **жирный + эмодзи**  
   • Подпункты → через `-` или `•`  
   • Технические детали → с цифрами/единицами измерений  
   • Источники → в квадратных скобках [1]  
   • Ключевые мысли → 💡 **жирно**  

2️⃣ **Визуал:**  
   • Каждый смысловой блок начинай с **тематического эмодзи** (🔍, 🧪, ⚙️, 📦, 💡)  
   • Для списков используй `•` вместо цифр (кроме пошаговых инструкций)  
   • Дели текст на блоки по 3-5 строк  

3️⃣ **Тон:**  
   • Профессионально, но дружелюбно (используй смайлики в конце ключевых выводов 😊)  
   • Никакой "воды" — только факты и выводы  

4️⃣ **Оформление ссылок:**  
   • URL → указывай как `[подпись](https://...)`  
   • Пример: Наш сайт: [modponsis.ru](https://modponsis.ru/)  

Пример корректного ответа:  
🔍 **Область применения**  
- Пункт 1...  
- Пункт 2 [3]  
💡 **Вывод:** Главное преимущество... 😊  ';
                return `${sender}: ${msg.textContent}`;
            })
            .join('\n\n');
        
        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `deepseek-chat-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showStatus('Чат экспортирован', 'success');
    });
    
    // Отображение статуса
    function showStatus(text, type) {
        statusDiv.textContent = text;
        statusDiv.className = 'status';
        
        switch (type) {
            case 'success':
                statusDiv.classList.add('status-success');
                break;
            case 'error':
                statusDiv.classList.add('status-error');
                break;
            case 'warning':
                statusDiv.classList.add('status-warning');
                break;
            case 'processing':
                statusDiv.classList.add('status-processing');
                break;
            default:
                statusDiv.classList.add('status-ready');
        }
    }
    
    // Обработчики событий
    sendBtn.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Инициализация статуса
    showStatus('Готов к работе', 'ready');
});
