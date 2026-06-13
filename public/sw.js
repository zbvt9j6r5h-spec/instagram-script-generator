const CACHE_NAME = 'instascript-v1'
const STATIC_URLS = [
  '/dashboard',
  '/analyze',
  '/account-analysis',
  '/offline',
]

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_URLS).catch(() => {}))
  )
  self.skipWaiting()
})

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ネットワーク優先、失敗時にキャッシュへフォールバック
self.addEventListener('fetch', event => {
  // POST / 外部リクエストはスキップ
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功したらキャッシュに保存
        if (response.ok && event.request.destination !== 'video') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(event.request).then(cached => {
          if (cached) return cached
          // HTML ページのフォールバック
          if (event.request.destination === 'document') {
            return caches.match('/offline') ?? new Response('オフライン中です', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
          }
          return new Response('', { status: 503 })
        })
      )
  )
})

// プッシュ通知（一時的に無効化）
// self.addEventListener('push', event => {
//   const data = event.data?.json() ?? {}
//   const title = data.title ?? 'InstaScript AI'
//   const options = {
//     body: data.body ?? '新しい通知があります',
//     icon: '/icons/icon-192.png',
//     badge: '/icons/icon-192.png',
//     data: { url: data.url ?? '/dashboard' },
//   }
//   event.waitUntil(self.registration.showNotification(title, options))
// })

// 通知クリック（一時的に無効化）
// self.addEventListener('notificationclick', event => {
//   event.notification.close()
//   const url = event.notification.data?.url ?? '/dashboard'
//   event.waitUntil(
//     clients.matchAll({ type: 'window' }).then(ws => {
//       const existing = ws.find(w => w.url.includes(url))
//       if (existing) return existing.focus()
//       return clients.openWindow(url)
//     })
//   )
// })
