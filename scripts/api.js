function loadServers(vm, selectedServerId, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/servers.json', true);
    xhr.send(null);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status !== 200) {
                alert(vm.$t('message.connection_failed'));
            } else {
                const servers = JSON.parse(xhr.responseText).servers;
                if (selectedServerId === null) {
                    vm.server = servers[0];
                } else {
                    vm.server = (() => {
                        for (const server of servers) {
                            if (server.id === selectedServerId) {
                                return server;
                            }
                        }
                    })();
                }
                vm.token = vm.server.is_enginetribe ? vm.server.tokens[vm.$i18n.locale] : vm.server.token;
                if (Cookies.exists(`${vm.server.id}_auth_code`)) {
                    vm.authCode = Cookies.get(`${vm.server.id}_auth_code`);
                    vm.imId = Cookies.get(`${vm.server.id}_im_id`);
                    if (typeof callback === 'function') {
                        callback(vm);
                    }
                } else {
                    window.location.href = '/user/login/';
                }
            }
        }
    }
}

function smmweApi(vm, api, args, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', vm.server.host + api, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('User-Agent', 'GameMaker HTTP/1.0.0 NivelesMundialesWeb/1.0.0')
    const args_string = (() => {
        let string = '';
        for (const arg in args) {
            string += `&${arg}=${args[arg]}`;
        }
        return string;
    })();
    xhr.send(
        `auth_code=${vm.authCode}&discord_id=${vm.imId}&token=${vm.token}` + args_string
    );
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status !== 200) {
                alert(vm.$t('message.connection_failed') + '\n' + xhr.status);
            } else {
                const response = JSON.parse(xhr.responseText);
                if (response.hasOwnProperty('error_type')) {
                    if (
                        [
                            'Código de autorización inválido.',
                            'Falta el Auth code.',
                            'Falta el Discord a ID del Auth code.',
                            'Session expired.'
                        ].indexOf(response.message) !== -1
                    ) {
                        Cookies.delete(`${vm.server.id}_auth_code`);
                        window.location.href = '/user/login/';
                    }
                    alert(
                        vm.$t('message.connection_failed') + '\n' +
                        response.error_type + ' - ' + response.message
                    );
                } else {
                    if (typeof callback === 'function') {
                        callback(vm, response);
                    }
                }
            }
        }
    }
}