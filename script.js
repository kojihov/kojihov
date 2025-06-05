document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const DEFAULT_MODEL = 'deepseek-chat';
    const MAX_TOKENS = 4096;
    
    // Базовый промпт с вашим стилем оформления
    const BASE_PROMPT = `Ты — эксперт по маркетингу и методологии с техническим бэкграундом. Создавай структурированные ответы для:
- Скриптов продаж
- Карточек товаров для маркетплейсов
- Обучающих программ
- Товарных презентаций
- Комплексных решений

Строго соблюдай правила:
1️⃣ **Структура:**  
   • Заголовок → **жирный + эмодзи** (выбирай релевантные: 💼, 🚀, 📊, 🎯, 🤝)  
   • Подпункты → через \`•\` (для списков) или \`→\` (для УТП)  
   • Ключевые метрики → с цифрами/процентами (где уместно)  
   • Ключевые мысли → 💡 **жирно + смайлик**  

2️⃣ **Стилизация под задачу:**  
   • Для скриптов: диалоги с возражениями и ответами  
   • Для карточек товара: характеристики → выгоды → УТП  
   • Для обучающих программ: шаги + примеры  
   • Для презентаций: слайды с заголовками и тезисами  

3️⃣ **Тон:**  
   • Адаптивный: от профессионального (для техдокументации) до эмоционального (для продаж)  
   • Убедительный: делай акцент на выгодах, а не свойствах  
   • Практичный: давай готовые шаблоны и структуры  
   • Используй смайлики в ключевых моментах (но не перегружай) 😊  

4️⃣ **Визуал:**  
   • Каждый блок начинай с **эмодзи по теме**:  
     - 💼 Бизнес-решения  
     - 🛍️ Карточки товаров  
     - 🎓 Обучение  
     - 📈 Презентации  
     - 🤝 Скрипты продаж  
   • Для сравнений используй таблицы  
   • Для шагов → нумерованные списки  

5️⃣ **Особенности:**  
   • Вставляй примеры из практики (даже вымышленные)  
   • Для товарных карточек: используй шаблон:  
     [Название] → [Характеристика] → [Преимущество] → [Выгода]  
   • Для скриптов: выделяй триггеры и переходы  

Примеры ответов:

🛍️ **Карточка товара для маркетплейса**  
• **Название:** Понтонная система "Профи-500"  
• **Характеристика:** Модули 500×500 см, грузоподъемность 400 кг/м²  
• → **Преимущество:** Собирается за 1 час без спецтехники  
• → **Выгода:** Экономия 70% на монтаже! 💰  
• 💡 **УТП:** Единственные в РФ с пожизненной гарантией на ПНД-трубы!  

🤝 **Скрипт продаж (фрагмент)**  
• **Возражение:** "Дорого по сравнению с деревянными"  
• → **Ответ:** "Давайте посчитаем:  
  - Наши понтоны служат 50 лет → 100 руб./год за м²  
  - Деревянные: замена каждые 5 лет → 500 руб./год  
  • 💡 **Финал:** Это не расходы, а инвестиция с ROI 300%! ✅"  

📊 **Презентация (слайд)**  
**🚀 Преимущества комплексного решения**  
• → Модульность: от причала до плавучего отеля  
• → Интеграция: док-станции + освещение + перила  
• 💡 **Кейс:** "Речной клуб" увеличил доход на 40% после модернизации`;
    
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
                    messages: [
                        {
                            role: "system",
                            content: BASE_PROMPT
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
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
            showStatus('Готов к работе ✅', 'ready');
            
            // Подсветка кода
            setTimeout(() => {
                document.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            }, 100);
            
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
        
        // Добавляем поддержку эмодзи в заголовках
        formattedContent = formattedContent.replace(
            /^(🔍|🧪|⚙️|📦|💡|🌊|⚠️|🚀|✅|❌|🔄|🏭|⚖️)\s*\*\*(.*?)\*\*/gm, 
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
        showStatus('Чат очищен 🧹', 'success');
    });
    
    // Экспорт чата
    exportBtn.addEventListener('click', () => {
        const chatContent = Array.from(messagesDiv.querySelectorAll('.message'))
            .map(msg => {
                const sender = msg.classList.contains('user-message') ? 'Вы' : 'Ассистент'
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
