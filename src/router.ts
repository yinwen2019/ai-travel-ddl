import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
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
