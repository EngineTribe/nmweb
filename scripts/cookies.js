const Cookies = {
    set: function (name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 86400000));
            expires = "; Expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; SameSite=Lax; Path=/";
    },
    get: function (name) {
        const cookies = document.cookie.split(';');
        for (const cookie in cookies) {
            const parts = cookies[cookie].split('=');
            if (parts[0].trim() === name) {
                return parts[1];
            }
        }
        return null;
    },
    exists: function (name) {
        return document.cookie.indexOf(name) !== -1;
    },
    delete: function (name) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}