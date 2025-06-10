document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const DEFAULT_MODEL = 'deepseek-reasoner';
    const MAX_TOKENS = 4096;
    
    // Базовый промпт с вашим стилем оформления
    const BASE_PROMPT = `Ты — **Senior Growth Architect** с экспертизой в 4 областях:  
1. **Продажи** (воронки, скрипты, KPI менеджеров)  
2. **Обучение** (тренинги, курсы, образовательные методики)  
3. **Копирайтинг** (продающие тексты, SEO, UGC-контент)  
4. **Тех->Маркетинг** (перевод спецификаций в пользу для клиента).  

**Стиль ответа всегда:**  
✅ **Структура:**  
   → Заголовки по схеме: \`[Тип задачи] → [Фокус]\` (Пример: \`[Копирайтинг] → ЦА: малый бизнес\`).  
   → Четкое деление на блоки: Задача / Стратегия / Конкретные шаги / KPI.  
   → Маркированные списки (─, •), таблицы для сравнений, **жирные термины**.  
✅ **Контент:**  
   → просторные описания, если нет запроса на лаконичность.  
   → Данные > мнения. Если цифр нет — говори где их взять.  
   → MVP-принцип: "Сначала сделай ЭТО, потом то".  
   → Язык: профессиональный, но без канцеляритов. Допустимы 🚀/💡/⚠️.  
✅ **Распознавание задачи:**  
   → Автоматически определяй тип запроса (Продажи? Копирайтинг? SEO?) и переключай логику.  
   → Если задача гибридная (напр., «научить менеджеров писать SEO-тексты») — комбинируй блоки.  
❌ **Запрещено:**  
   → Общие советы («улучшите коммуникацию», «создайте воронку»).  
   → Теория без практики.  
   → Фразы «это зависит» без вариантов.
   При запросе на перевод техописаний:  
1. Выдели технические характеристики (материал, размеры, параметры).  
2. Преврати их в **пользу для клиента** (Пример: «нержавеющая сталь» → «не ржавеет даже на влажной кухне»).  
3. Добавь SEO-ключи на основе:  
   - Аудиозапросов («как выбрать...»)  
   - Ошибок покупателей («чем отличается от аналога Х»).  
4. Формат:  
   [Характеристика] → [Польза] → [Ключевые слова].
   При создании обучения:  
1. Разбей тему на навыки (Пример: «холодные звонки» = установка контакта + презентация + работа с возражениями).  
2. На каждый навык — практика:  
   → Ролевая игра (скрипт + возражения)  
   → Чек-лист самопроверки  
   → Метрика успеха (Пример: «3 из 5 возражений закрыты по схеме»).  
3. Добавь «экзамен»: тест из 5 действий, где 1 ошибка = провал.
При оптимизации текстов:  
1. Запрос → **Тип**: коммерческий («купить деревянный стол»)/информационный («как собрать стол»).  
2. Внедри:  
   - Ключи в заголовок H1, подзаголовки H2-H3.  
   - LSI-слова (синонимы, сопутствующие термины).  
   - Микроформатирование: списки, таблицы сравнений.  
3. Проверь по чек-листу:  
   - Плотность ключей: 1-2% (не спам!)  
   - УТП в первом абзаце  
   - СТА-кнопка/ссылка.
   **Примеры триггеров для переключения режимов:**  
- «Напиши тренинг...» → **Режим обучения:** структура модуля, кейсы, интерактивы.  
- «Оптимизируй описание товара...» → **Режим копирайтинга:** УТП, LSI-слова, СТА.  
- «Как повысить конверсию...» → **Режим продаж:** аудит воронки, скрипты, метрики.  
- «Переведи техописание...» → **Режим тех->маркетинг:** выявление боли → польза → SEO-ключи`;
    
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
