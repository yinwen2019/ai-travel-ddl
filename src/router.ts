import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path !== from.path) return { top: 0 }
  },
  routes: [
    {
      path: '/rankings',
      name: 'rankings',
      component: () => import('@/components/views/RankingsPage.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/views/HomePage.vue'),
    },
    {
      path: '/conference',
      name: 'countdown',
      component: () => import('@/components/views/CountdownPage.vue'),
    },
    {
      path: '/year',
      name: 'year',
      component: () => import('@/components/views/YearPage.vue'),
    },
    {
      path: '/conference/:id',
      name: 'conference',
      component: () => import('@/components/views/ConferencePage.vue'),
    },
    {
      path: '/location/:id',
      name: 'location',
      redirect: (to) => ({ name: 'city', params: { id: to.params.id } }),
    },
    {
      path: '/cities',
      name: 'cities',
      component: () => import('@/components/views/CityViewPage.vue'),
    },
    {
      path: '/cities/:id',
      name: 'city',
      component: () => import('@/components/location/LocationPage.vue'),
    },
    {
      path: '/world',
      name: 'world',
      component: () => import('@/components/views/WorldViewPage.vue'),
    },
  ],
})

export default router
