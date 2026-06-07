class MyAIPlugin {
    async init() {
        try {
            const editorManager = acode.require('editorManager');
            if (editorManager && editorManager.editor) {
                editorManager.editor.commands.addCommand({
                    name: "ask-remote-ai",
                    bindKey: { win: "Ctrl-Shift-A", mac: "Command-Shift-A" },
                    exec: this.askAI.bind(this)
                });
                window.toast("Remote AI Plugin සක්‍රීයයි! 🎉", 2000);
            }
        } catch (e) { console.error(e); }
    }

    async askAI() {
        try {
            const editorManager = acode.require('editorManager');
            const text = editorManager.editor.session.getValue();
            
            if (!text) {
                window.toast("කරුණාකර කෝඩ් එකක් ඇතුළත් කරන්න!", 2000);
                return;
            }

            // මුලින්ම පෝන් එකේ API Key එක සේව් වෙලා තියෙනවද බලනවා
            let apiKey = localStorage.getItem('my_gemini_api_key');
            
            // සේව් වෙලා නැත්නම් විතරක් Box එකක් දාලා ඔයාගෙන් අහනවා
            if (!apiKey) {
                apiKey = prompt("කරුණාකර ඔබගේ Google Gemini API Key එක ඇතුළත් කරන්න:");
                if (!apiKey) return;
                localStorage.setItem('my_gemini_api_key', apiKey); // ෆෝන් එකේ සේව් කරගන්නවා
            }

            window.toast("Gemini වෙත යවමින්...", 2000);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Explain this code and check for errors:\n\n" + text }] }]
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                alert("API Error: " + data.error.message);
                // වැරදි කී එකක් දුන්නොත් ආයෙත් දාන්න පුළුවන් වෙන්න සේව් කරපු එක මකනවා
                localStorage.removeItem('my_gemini_api_key'); 
                return;
            }

            alert("AI Response:\n\n" + data.candidates[0].content.parts[0].text);
            
        } catch (error) {
            alert("Error: " + error.message);
        }
    }

    async destroy() {
        try {
            const editorManager = acode.require('editorManager');
            editorManager.editor.commands.removeCommand("ask-remote-ai");
        } catch(e) {}
    }
}

if (window.acode) {
    const myPlugin = new MyAIPlugin();
    acode.setPluginInit("com.myremote.gemini", () => myPlugin.init());
    acode.setPluginUnmount("com.myremote.gemini", () => myPlugin.destroy());
}
