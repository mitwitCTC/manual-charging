import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

function isBase64Encoded(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:c',
      name: 'home',
      component: HomeView,
      beforeEnter: (to, from, next) => {
        // 獲取路由參數 c 
        const c = to.params.c;

        // 判斷參數是否經過 Base64 加密
        const isBase64 = isBase64Encoded(c);

        if (!isBase64) {
          // 如果未經過加密，則進行加密
          const base64EncodedC = btoa(c);
          // 重新導到加密後的路由
          next({ path: '/' + base64EncodedC });
        } else {
          // 如果已經經過加密，則繼續瀏覽
          next();
        }
      },
    },
  ],
})

export default router
