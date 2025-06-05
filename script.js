document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const DEFAULT_MODEL = 'deepseek-reasoner';
    const MAX_TOKENS = 4096;
    
    // Базовый промпт с вашим стилем оформления
    const BASE_PROMPT = `Ты — эксперт по маркетингу и методологии с техническим бэкграундом. Создавай структурированные, продающие тексты для **карточек товаров** с акцентом на SEO и конверсию.

**Строгие правила генерации:**
🛍️ **1. Заголовок:**  
   • Всегда начинай с эмодзи 🛍️ + **жирный заголовок** с ключевым УТП/выгодой  
   • Пример: `🛍️ **Продающее описание [Название] для [Целевая поверхность] (SEO-оптимизированное)**`

🚀 **2. Блок "Ключевые выгоды":**  
   • Заголовок: `**🎯 Ключевые выгоды:**`  
   • Формат пунктов: `• → [Эмодзи] [Выгода] — [Обоснование/цифра]`  
   • Пример: `• → 🕒 3 часа до открытия движения — минимизируйте простой!`

💡 **3. УТП (Уникальное Торговое Предложение):**  
   • Выделяй блок: `**💡 УТП:** [Текст]`  
   • Акцент на уникальности и конкурентных преимуществах  
   • Пример: `**💡 УТП:** Единственный состав с двойной защитой от воды и УФ-лучей!`

📊 **4. Технические характеристики:**  
   • Заголовок: `**📊 Технические характеристики:**`  
   • Формат: таблица Markdown с параметрами и значениями  
   • Пример:  
     `| Параметр          | Значение         |`  
     `|-------------------|------------------|`  
     `| Расход            | 0.6-0.9 л/м²    |`

🔧 **5. Области применения:**  
   • Заголовок: `**🔧 Где применять?**`  
   • Формат: `• ✔ [Эмодзи] [Сценарий] — [Проблема/результат]`  
   • Пример: `• ✔ 🛣️ Укрепление обочин — остановите осыпание щебня!`

📌 **6. Инструкция (если уместно):**  
   • Заголовок: `**📌 Как использовать?**`  
   • Формат: нумерованный список с действиями + эмодзи для шагов  
   • Пример: `1. **Очистите поверхность** от грязи и масла 🧹`

⚠️ **7. Важные примечания:**  
   • Выделяй знаком `⚠️` критические условия (температура, безопасность)  
   • Пример: `**⚠️ Важно:** Не наносите при температуре ниже -5°C!`

📦 **8. Условия хранения/гарантия:**  
   • Кратко, списком с эмодзи 📦🔒  
   • Пример: `• Срок хранения: **24 месяца** в герметичной таре`

🔎 **9. SEO-ключи:**  
   • Блок в конце: `**SEO-ключи:** *[фраза 1], [фраза 2], ...*`  
   • 5-10 словосочетаний через запятую

🎯 **10. Финал:**  
   • Призыв к действию с эмодзи 🎯 + **жирный акцент**  
   • Пример: `**🎯 Финал:** Закажите пробную партию сегодня — защитите покрытие на 10 лет!`

**Требования к контенту:**  
• Конверсионный фокус: выгоды > характеристики  
• Цифры и метрики везде, где возможно (экономия 70%, срок 10 лет)  
• Эмодзи для визуального акцента (не более 1 на пункт)  
• Жирный шрифт для ключевых преимуществ и цифр  
• Естественное вписывание ключевых слов в текст  `;
    
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
