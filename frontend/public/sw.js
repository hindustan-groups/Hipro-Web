// Service Worker for Hindustan Projects Web Push Notifications

self.addEventListener("push", function (event) {
  let data = {
    title: "Hindustan Projects",
    body: "New update from Hindustan Projects!",
    icon: "/logo.jpg",
    badge: "/logo.jpg",
    url: "/",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/logo.jpg",
    badge: data.badge || "/logo.jpg",
    image: data.image || undefined,
    data: {
      url: data.url || "/",
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: "explore", title: "View Details" },
      { action: "close", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && "focus" in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
