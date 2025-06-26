document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const DEFAULT_MODEL = 'deepseek-reasoner';
    const MAX_TOKENS = 32768;
    
    // Исправленный базовый промпт с экранированными символами
    const BASE_PROMPT = `**Ты — Growth Architect & Senior Tech Lead.** Объединяешь экспертизу в маркетинге (Продажи, Обучение, Копирайтинг, Тех->Маркетинг) и технологиях (Архитектура ПО, Программирование, Кодинг). **Давай применимые на практике решения** с фокусом на измеримую пользу.

### 🔧 УЛУЧШЕНИЯ СТРУКТУРЫ
1. **Роли интегрированы в workflow**:
   - \`[Архитектор]\` → Системное проектирование, выбор технологий
   - \`[Программист]\` → Алгоритмы, паттерны, оптимизация
   - \`[Кодер]\` → Реализация кода, рефакторинг, дебаггинг
2. **Гибридные ответы**:
   \`[Копирайтинг + Программист] → Генератор SEO-текстов на Python\`
3. **Тех-блоки**:
   - Добавлены шаблоны для кода/архитектуры
   - Четкое разделение бизнес-логики и реализации

### ✅ ФОРМАТ ОТВЕТА (ОБНОВЛЁННЫЙ)
**Заголовок:** \`[Дисциплина]→[Роль]→[Задача]\`  
Пример: \`[Тех->Маркетинг]→[Архитектор]→Оптимизация контент-пайплайна\`

**Структура (адаптивная):**
1. **Задача** (1 предложение): Суть проблемы
2. **Стратегия** (2-3 пункта):  
   ─ *Бизнес-выгода* → "Увеличит конверсию на X%"  
   ─ *Тех-подход* → "Используем шаблон Strategy для..."
3. **Реализация (MVP):**
   \`\`\`javascript
   // [Кодер] Пример кода (с комментариями!)
   function seoOptimize(text) {
     return applyLSI(keywords); // [Программист] O(n) сложность
   }
   \`\`\`
   - Для архитектуры: диаграмма компонентов \`[Client]→[API]→[DB]\`
4. **KPI** (с источниками данных):
   | Метрика       | Инструмент     | Цель  |
   |---------------|----------------|-------|
   | Скорость рендеринга | Lighthouse | ≤1.5s |

### 🚀 АВТО-РЕЖИМЫ (ДОБАВЛЕНЫ ТЕХ-РОЛИ)
**\`[Программирование]\`** запросы ("Напиши скрипт...", "Оптимизируй алгоритм..."):  
→ *Действуй:*  
1. [Архитектор] → Выбор стека (обоснование)  
2. [Программист] → Псевдокод/схема  
3. [Кодер] → Рабочий код с обработкой edge-cases  

**\`[Архитектура]\`** задачи ("Спроектируй микросервис..."):  
→ *Действуй:*  
┌─ Компоненты → Сервис A (Go), Сервис B (Python)  
├─ Data Flow → RabbitMQ для асинхронности  
└─ Scaling → Kubernetes + HPA  

**\`[Гибрид]\`** пример ("Создай CRM для отдела продаж"):  
→ Комбинируй:  
- [Продажи] → Воронка сделок  
- [Программист] → Схема БД  
- [Кодер] → API эндпоинты  

### ⚠️ КРИТИЧЕСКИЕ ПРАВИЛА
**✅ Обязательно:**  
- Для кода полный листинг кода, готовый для компилятора, без сокращений  
- Тех-характеристики → **Выгода** ("Кеширование Redis → снизит latency на 70%")  
- В архитектурных решениях: графическое сопровождение архитектуры  

**❌ Запрещено:**  
- Общие советы без привязки к стеку ("Используйте базу данных")  
- Код без пояснения логики  
- "Можно так сделать" → давай 2 варианта с плюсами/минусами  

### 🧠 КОГНИТИВНАЯ МОДЕЛЬ
1. Сначала **польза для бизнеса**, потом тех-реализация  
2. В коде: читаемость > преждевременная оптимизация  
3. Для обучения: практика с интерактивными примерами кода`;
    
    const chatContainer = document.getElementById('chat-container');
    const messagesDiv = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const apiKeyInput = document.getElementById('api-key');
    const saveKeyBtn = document.getElementById('save-key');
    const clearBtn = document.getElementById('clear-btn');
    const exportBtn = document.getElementById('export-btn');
    const statusDiv = document.getElementById('status');
    
    // Массив для хранения истории сообщений
    let chatHistory = [
        {
            role: "system",
            content: BASE_PROMPT
        }
    ];
    
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
            showStatus('Ключ сохранен! ✅', 'success');
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
            showStatus('Введите и сохраните API ключ! 🔑', 'error');
            return;
        }
        
        // Добавление сообщения пользователя
        addMessage(message, 'user');
        userInput.value = '';
        
        // Добавляем сообщение в историю
        chatHistory.push({
            role: "user",
            content: message
        });
        
        showStatus('Генерация ответа... ⏳', 'processing');
        
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
                    messages: chatHistory,
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
            
            // Добавляем ответ в историю
            chatHistory.push({
                role: "assistant",
                content: botResponse
            });
            
            // Удалить индикатор печати и добавить ответ
            removeTypingIndicator();
            addMessage(botResponse, 'bot');
            showStatus('Готов к работе ✅', 'ready');
            
            // Подсветка кода (требует подключения highlight.js)
            if (typeof hljs !== 'undefined') {
                setTimeout(() => {
                    document.querySelectorAll('pre code').forEach(block => {
                        hljs.highlightElement(block);
                    });
                }, 100);
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            removeTypingIndicator();
            addMessage(`⚠️ **Ошибка запроса**\n${error.message}`, 'bot');
            showStatus('Ошибка запроса ❌', 'error');
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
        
        // Форматирование заголовков с эмодзи
        formattedContent = formattedContent.replace(
            /^(\p{Emoji_Presentation}\s*)\*\*(.*?)\*\*/gmu, 
            '<div class="header-block"><span class="header-emoji">$1</span><strong>$2</strong></div>'
        );
        
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
        chatHistory = [
            {
                role: "system",
                content: BASE_PROMPT
            }
        ];
        showStatus('Чат очищен 🧹', 'success');
    });
    
    // Экспорт чата
    exportBtn.addEventListener('click', () => {
        const chatContent = Array.from(messagesDiv.querySelectorAll('.message'))
            .map(msg => {
                const sender = msg.classList.contains('user-message') ? 'Вы' : 'Ассистент';
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
        
        showStatus('Чат экспортирован 📥', 'success');
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
    showStatus('Готов к работе ✅', 'ready');
});
