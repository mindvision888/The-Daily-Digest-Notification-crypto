document.addEventListener('DOMContentLoaded', () => {
    const digestButton = document.getElementById('digestButton');
    const resultDiv = document.getElementById('result');

    digestButton.addEventListener('click', getDailyDigest);

    async function getDailyDigest() {
        // 1. Блокирај го копчето и прикажи loading порака
        digestButton.disabled = true;
        resultDiv.innerHTML = '<p class="loading-message">🚀 **Groq** работи... генерирањето на Digest-от е во тек! (Многу брзо!) 🚀</p>';

        try {
            // 2. Повикување на Vercel Serverless Function
            const response = await fetch('/api/digest', { 
                method: 'POST', // Ја користиме POST методата како што е дефинирано во digest.js
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.status === 200 && data.status === 'success') {
                displayDigest(data.digest); 
            } else {
                // Прикажи порака за грешка
                resultDiv.innerHTML = `<div class="error-message">
                                          <h3>❌ Грешка при генерирањето</h3>
                                          <p>Неуспешно генерирање. Проверете ја Vercel Serverless функцијата.</p>
                                          <pre>${data.message || 'Непозната грешка.'}</pre>
                                       </div>`;
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            resultDiv.innerHTML = `<div class="error-message">
                                      <h3>⚠️ Мрежна Грешка</h3>
                                      <p>Проблем со комуникација со серверот. Проверете ја вашата интернет конекција или Vercel деплојментот.</p>
                                   </div>`;
        } finally {
            // 3. Отклучи го копчето
            digestButton.disabled = false;
        }
    }

    function displayDigest(digestArray) {
        if (!digestArray || digestArray.length === 0) {
            resultDiv.innerHTML = '<p>Не се пронајдени пазарно важни вести за денес.</p>';
            return;
        }

        let html = '<h2 style="border-bottom: 2px dashed #ccc; padding-bottom: 15px;">🔥 Дневен Крипто Digest 🔥</h2>';
        
        digestArray.forEach((item, index) => {
            // Дизајн на Digest Card
            html += `<div class="digest-card">
                        <h3>${index + 1}. ${item.headline}</h3>
                        <p>${item.summary}</p>
                        <p>Извор: <a href="${item.source}" target="_blank">${new URL(item.source).hostname}</a></p>
                    </div>`;
        });

        resultDiv.innerHTML = html;
    }
});
