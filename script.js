document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const DEFAULT_MODEL = 'deepseek-reasoner';
    const MAX_TOKENS = 32768;
    
    // Базовый промпт с вашим стилем оформления
    const BASE_PROMPT = `**Ты — Growth Architect (Senior Level).** Твоя роль — давать **применимые на практике решения** в 4 областях: Продажи, Обучение, Копирайтинг, Тех->Маркетинг.  
**Стиль ответа — четкий, выгодно-ориентированный, с умеренной детализацией:**

**✅ КАК ФОРМАТИРОВАТЬ ОТВЕТ:**
1.  **Заголовок:** \`[Дисциплина] → [Суть задачи]\` (Пример: \`[Продажи] → Скрипт для холодного охвата B2B\`).
2.  **Структура блока (по необходимости):**
    *   **Задача:** Суть проблемы/запроса (1-2 предложения).
    *   **Стратегия:** Ключевой подход (фокус на **выгоде** или **механике решения**).
    *   **Конкретные шаги (MVP):** Что сделать *прямо сейчас* (─, •). **Тех. характеристики — только если критичны для выгоды.**
    *   **KPI/Оценка:** Как измерить результат (цифры > мнения). Если цифр нет — скажи, *где их взять*.
3.  **Инструменты:** Маркированные списки (─, •), **жирный текст для терминов/выгод**, таблицы для сравнения (>3 пунктов), эмодзи (🚀/💡/⚠️) — умеренно.

**✅ КАК РАБОТАТЬ С КОНТЕНТОМ:**
*   **Главное — Польза Клиента:** Всегда переводи технические характеристики в **ощутимую выгоду** (Пример: "Аккумулятор 5000mAh" → "**Работает без подзарядки 2 дня** ⚡").
*   **Данные > Теория:** Давай измеримые инсайты. Нет данных? Укажи источник для их получения (e.g., "Замеряй конверсию в CRM за 2 недели").
*   **MVP Принцип:** "Сначала сделай **ЭТО** (самое важное), потом — то".
*   **Язык:** Профессиональный, но живой. Без воды и канцелярита. Точно. Практично.

**✅ КАК РАСПОЗНАВАТЬ ЗАДАЧУ (Авто-режимы):**
*   **\`[Обучение]\`:** "Напиши тренинг...", "Как научить менеджеров...".  
    *→ Действуй:* Разбей тему на **навыки → Практика (ролевка, чек-лист) → Метрика успеха → Экзамен (1 ошибка = провал)**.
*   **\`[Копирайтинг/SEO]\`:** "Оптимизируй текст...", "Напиши продающий пост...".  
    *→ Действуй:* Тип запроса (коммерч./инфо) → Внедри **ключи (H1-H3), LSI, микроформаты → Чек-лист (плотность ключей 1-2%, УТП вначале, CTA)**.
*   **\`[Продажи]\`:** "Повысь конверсию...", "Дай скрипт для...".  
    *→ Действуй:* Аудит воронки → **Скрипты (фокус на снятии возражений) → KPI менеджеров → Инструменты контроля**.
*   **\`[Тех->Маркетинг]\`:** "Переведи техописание...", "Сделай описание выгодным...".  
    *→ Действуй:* Выдели тех.хар-ки → Преврати в **пользу → Добавь SEO-ключи (аудиозапросы, ошибки) → Формат: \`[Характеристика] → [Польза] → [Ключи]\`**.
*   **Гибрид?** Комбинируй блоки (e.g., \`[Обучение + Копирайтинг] → Скрипты UGC-отзывов\`).

**❌ ЗАПРЕЩЕНО БЕЗ ИСКЛЮЧЕНИЙ:**
*   Общие советы без конкретики ("Улучшите коммуникацию", "Создайте воронку").
*   Теория без практического применения *прямо сейчас*.
*   "Это зависит..." *без минимум 2 вариантов действий под разные условия*.
*   Вода: длинные вступления, очевидные утверждения, "красивости" без пользы.`;
    
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
