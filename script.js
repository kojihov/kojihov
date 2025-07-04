document.addEventListener('DOMContentLoaded', () => {
    // Константы API
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const KLING_API_URL = "https://api-singapore.klingai.com/v1/images/generations";
    const DEFAULT_MODEL = 'deepseek-reasoner';
    const MAX_TOKENS = 32768;
    
    // Базовый промпт для DeepSeek
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
    
    // Элементы интерфейса
    const chatContainer = document.getElementById('chat-container');
    const messagesDiv = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const apiKeyInput = document.getElementById('api-key');
    const klingAccessKeyInput = document.getElementById('kling-access-key');
    const klingSecretKeyInput = document.getElementById('kling-secret-key');
    const saveKeysBtn = document.getElementById('save-keys');
    const clearBtn = document.getElementById('clear-btn');
    const exportBtn = document.getElementById('export-btn');
    const statusDiv = document.getElementById('status');
    const modeToggleBtn = document.getElementById('mode-toggle');
    const fileUpload = document.getElementById('file-upload');
    const fileList = document.getElementById('file-list');
    const fileUploadContainer = document.getElementById('file-upload-container');
    
    // Переменные состояния
    let chatHistory = [
        {
            role: "system",
            content: BASE_PROMPT
        }
    ];
    let currentMode = 'chat'; // 'chat' или 'image'
    let uploadedFiles = [];
    let taskCheckInterval = null;
    
    // Загрузка сохраненных ключей
    const savedDeepseekKey = localStorage.getItem('deepseekApiKey');
    const savedKlingAccessKey = localStorage.getItem('klingAccessKey');
    const savedKlingSecretKey = localStorage.getItem('klingSecretKey');
    
    if (savedDeepseekKey) apiKeyInput.value = savedDeepseekKey;
    if (savedKlingAccessKey) klingAccessKeyInput.value = savedKlingAccessKey;
    if (savedKlingSecretKey) klingSecretKeyInput.value = savedKlingSecretKey;
    
    // Сохранение всех ключей
    saveKeysBtn.addEventListener('click', () => {
        const deepseekKey = apiKeyInput.value.trim();
        const klingAccessKey = klingAccessKeyInput.value.trim();
        const klingSecretKey = klingSecretKeyInput.value.trim();
        
        if (deepseekKey) localStorage.setItem('deepseekApiKey', deepseekKey);
        if (klingAccessKey) localStorage.setItem('klingAccessKey', klingAccessKey);
        if (klingSecretKey) localStorage.setItem('klingSecretKey', klingSecretKey);
        
        showStatus('Ключи сохранены! ✅');
    });
    
    // Переключение режимов
    modeToggleBtn.addEventListener('click', () => {
        currentMode = currentMode === 'chat' ? 'image' : 'chat';
        modeToggleBtn.textContent = `Режим: ${currentMode === 'chat' ? 'Чат' : 'Генерация изображений'}`;
        fileUploadContainer.classList.toggle('hidden', currentMode === 'image');
        userInput.placeholder = currentMode === 'chat' 
            ? "Введите сообщение (Shift+Enter для переноса, Enter для отправки)..." 
            : "Опишите изображение для генерации...";
    });
    
    // Обработка загрузки файлов
    fileUpload.addEventListener('change', (e) => {
        fileList.innerHTML = '';
        uploadedFiles = Array.from(e.target.files);
        
        uploadedFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name} (${formatFileSize(file.size)})</span>
                <button class="remove-file" data-name="${file.name}">×</button>
            `;
            fileList.appendChild(fileItem);
        });
        
        // Обработка удаления файлов
        document.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', () => {
                const fileName = btn.dataset.name;
                uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
                fileList.removeChild(btn.parentElement);
            });
        });
    });
    
    // Форматирование размера файла
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Отправка сообщения/генерация изображения
    async function sendMessage() {
        if (currentMode === 'image') {
            await generateImage();
        } else {
            await sendChatMessage();
        }
    }
    
    // Отправка сообщения в чате с файлами
    async function sendChatMessage() {
        const message = userInput.value.trim();
        const apiKey = localStorage.getItem('deepseekApiKey');
        
        if (!message && uploadedFiles.length === 0) {
            showStatus('Введите сообщение или загрузите файл');
            return;
        }
        
        if (!apiKey) {
            showStatus('Введите и сохраните DeepSeek API ключ! 🔑');
            return;
        }
        
        // Добавление сообщения пользователя
        addMessage(message, 'user');
        userInput.value = '';
        
        // Добавляем файлы к сообщению
        let fullMessage = message;
        if (uploadedFiles.length > 0) {
            try {
                const fileContents = await Promise.all(
                    uploadedFiles.map(file => readFileAsText(file))
                );
                
                const filesInfo = fileContents.map((content, i) => 
                    `\n\n[Файл ${i+1}: ${uploadedFiles[i].name}]\n${content}`
                ).join('\n\n');
                
                fullMessage = `${filesInfo}\n\n${message}`;
                
                // Очищаем загруженные файлы
                uploadedFiles = [];
                fileList.innerHTML = '';
                fileUpload.value = '';
            } catch (error) {
                addMessage(`⚠️ **Ошибка чтения файлов**\n${error.message}`, 'bot');
                return;
            }
        }
        
        // Добавляем сообщение в историю
        chatHistory.push({
            role: "user",
            content: fullMessage
        });
        
        showStatus('Генерация ответа... ⏳');
        showTypingIndicator();
        
        try {
            const response = await fetchWithTimeout(DEEPSEEK_API_URL, {
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
            }, 60000); // Таймаут 60 секунд
            
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
            showStatus('Готов к работе ✅');
            
            // Подсветка кода
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
            showStatus('Ошибка запроса ❌');
        }
    }
    
    // Генерация изображения
    async function generateImage() {
        const prompt = userInput.value.trim();
        const accessKey = localStorage.getItem('klingAccessKey');
        const secretKey = localStorage.getItem('klingSecretKey');
        
        if (!accessKey || !secretKey) {
            showStatus('Введите ключи Kling AI! 🔑');
            return;
        }
        
        if (!prompt) {
            showStatus('Введите описание изображения');
            return;
        }

        // Добавляем сообщение пользователя
        addMessage(`🎨 **Запрос на генерацию изображения:**\n${prompt}`, 'user');
        userInput.value = '';
        
        showStatus('Генерация изображения... 🎨');
        showTypingIndicator();

        try {
            // Генерация JWT токена
            const token = await generateKlingToken(accessKey, secretKey);
            if (!token) throw new Error('Ошибка генерации токена');
            
            console.log('Сгенерированный JWT токен:', token);

            const payload = {
                model_name: "kling-v2",
                prompt: prompt,
                negative_prompt: "ugly, deformed, blurry, watermark, text",
                resolution: "1k",
                aspect_ratio: "1:1",
                n: 1
            };

            const response = await fetchWithTimeout(KLING_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }, 30000); // Таймаут 30 секунд

            // Обработка HTTP ошибок
            if (!response.ok) {
                let errorText = 'Неизвестная ошибка';
                try {
                    const errorData = await response.json();
                    errorText = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    errorText = await response.text();
                }
                throw new Error(`Ошибка API [${response.status}]: ${errorText}`);
            }

            const data = await response.json();
            if (data.code !== 0) {
                throw new Error(data.message || 'Ошибка генерации');
            }
            
            const taskId = data.data.task_id;
            console.log('Задача создана, ID:', taskId);
            
            // Запускаем проверку статуса задачи
            const imageUrl = await checkKlingTaskStatus(taskId, token);
            
            if (imageUrl) {
                addImageToChat(imageUrl, prompt);
                showStatus('Изображение готово! ✅');
            } else {
                throw new Error('Не удалось получить изображение');
            }
        } catch (error) {
            console.error('Ошибка генерации изображения:', error);
            addMessage(`⚠️ **Ошибка генерации**\n${error.message}`, 'bot');
            showStatus('Ошибка генерации ❌');
        } finally {
            removeTypingIndicator();
        }
    }
    
    // Fetch с таймаутом
    async function fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Таймаут запроса (${timeout} мс)`);
            }
            throw error;
        }
    }
    
    // Генерация JWT токена для Kling (Web Crypto API)
    async function generateKlingToken(accessKey, secretKey) {
        try {
            const currentTime = Math.floor(Date.now() / 1000);
            const header = { 
                "alg": "HS256", 
                "typ": "JWT" 
            };
            
            const payload = {
                "iss": accessKey,
                "exp": currentTime + 1800,
                "nbf": currentTime - 5
            };
            
            // Кодирование заголовка и payload
            const encoder = new TextEncoder();
            const encodedHeader = base64UrlEncode(JSON.stringify(header));
            const encodedPayload = base64UrlEncode(JSON.stringify(payload));
            const unsignedToken = `${encodedHeader}.${encodedPayload}`;
            
            // Создание подписи
            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(secretKey),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );
            
            const signature = await crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(unsignedToken)
            );
            
            // Конвертация подписи в base64url
            const signatureArray = Array.from(new Uint8Array(signature));
            const signatureString = String.fromCharCode(...signatureArray);
            const encodedSignature = base64UrlEncode(signatureString);
            
            return `${unsignedToken}.${encodedSignature}`;
            
        } catch (e) {
            console.error('Ошибка генерации JWT токена:', e);
            return null;
        }
    }
    
    // Кодирование в Base64URL
    function base64UrlEncode(str) {
        const base64 = btoa(unescape(encodeURIComponent(str)));
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    
    // Проверка статуса задачи Kling (с интервалами)
    async function checkKlingTaskStatus(taskId, token) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 30;
            const interval = 5000; // 5 секунд
            
            const checkInterval = setInterval(async () => {
                attempts++;
                showStatus(`Проверка статуса изображения (${attempts}/${maxAttempts})`);
                
                try {
                    const response = await fetchWithTimeout(`${KLING_API_URL}/${taskId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }, 10000);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    if (data.code !== 0) {
                        throw new Error(data.message || 'Ошибка статуса задачи');
                    }
                    
                    const status = data.data.task_status;
                    
                    if (status === 'succeed') {
                        clearInterval(checkInterval);
                        resolve(data.data.task_result.images[0].url);
                    } else if (status === 'failed') {
                        clearInterval(checkInterval);
                        reject(new Error(data.data.task_status_msg || 'Ошибка генерации'));
                    } else if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        reject(new Error('Превышено время ожидания генерации'));
                    }
                } catch (error) {
                    if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        reject(new Error(`Ошибка проверки статуса: ${error.message}`));
                    }
                }
            }, interval);
        });
    }
    
    // Добавление изображения в чат
    function addImageToChat(url, prompt) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        messageDiv.innerHTML = `
            <div class="header-block">
                <span class="header-emoji">🎨</span>
                <strong>Сгенерировано изображение</strong>
            </div>
            <img src="${url}" alt="${prompt}" class="generated-image">
            <p><em>Описание:</em> ${prompt}</p>
        `;
        messagesDiv.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Чтение файла как текст
    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            // Ограничение размера файла (5 МБ)
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                reject(new Error(`Файл слишком большой (${formatFileSize(file.size)}). Максимум 5 МБ`));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
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
        showStatus('Чат очищен 🧹');
    });
    
    // Экспорт чата
    exportBtn.addEventListener('click', () => {
        const chatContent = Array.from(messagesDiv.querySelectorAll('.message'))
            .map(msg => {
                const sender = msg.classList.contains('user-message') ? 'Вы' : 'Ассистент';
                const textContent = msg.textContent;
                
                // Обработка изображений
                const images = msg.querySelectorAll('.generated-image');
                let imageText = '';
                if (images.length > 0) {
                    imageText = '\n[Изображение]: ' + Array.from(images)
                        .map(img => img.src)
                        .join('\n');
                }
                
                return `${sender}: ${textContent}${imageText}`;
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
        
        showStatus('Чат экспортирован 📥');
    });
    
    // Отображение статуса
    function showStatus(text) {
        statusDiv.textContent = text;
        
        // Автоматическая очистка статуса через 5 секунд
        clearTimeout(showStatus.timeout);
        if (text !== 'Готов к работе ✅') {
            showStatus.timeout = setTimeout(() => {
                statusDiv.textContent = 'Готов к работе ✅';
            }, 5000);
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
    showStatus('Готов к работе ✅');
});