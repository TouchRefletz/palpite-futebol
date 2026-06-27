// Service Worker para Web Push Notifications
self.addEventListener('push', function(event) {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.warn('Push event payload is not JSON, falling back to text:', event.data.text());
      data = { title: 'Bolão Futebol', body: event.data.text() };
    }
  }

  const title = data.title || 'Alerta do Bolão!';
  const options = {
    body: data.body || 'Nova atualização disponível!',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'bolao-alert',
    renotify: data.renotify !== undefined ? data.renotify : true,
    data: {
      url: data.url || '/'
    },
    // Para vibração (se suportado no celular)
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const targetUrl = event.notification.data.url;

  // Tenta focar em uma aba aberta do Bolão ou abre uma nova
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Procura se o app já está aberto em alguma aba
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(location.origin) && 'focus' in client) {
          // Se sim, foca e redireciona (se necessário)
          if (targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Se não estiver aberto, abre uma nova aba
      if (clients.openWindow) {
        return clients.openWindow(targetUrl || '/');
      }
    })
  );
});
