import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [{
        path: '/markdown',
        name: 'markdown',
        component: () => import('@/views/Markdown.vue'),
        children: [{
        path: 'test.1',
        name: 'test.1',
        component: r => require.ensure([], r(require('@/docs/test.1.md')))
    },{
        path: 'test.2',
        name: 'test.2',
        component: r => require.ensure([], r(require('@/docs/test.2.md')))
    },{
        path: 'test.3',
        name: 'test.3',
        component: r => require.ensure([], r(require('@/docs/test.3.md')))
    },{
        path: 'test.4',
        name: 'test.4',
        component: r => require.ensure([], r(require('@/docs/test.4.md')))
    },{
        path: 'test.5',
        name: 'test.5',
        component: r => require.ensure([], r(require('@/docs/test.5.md')))
    },{
        path: 'test.6',
        name: 'test.6',
        component: r => require.ensure([], r(require('@/docs/test.6.md')))
    },{
        path: 'test',
        name: 'test',
        component: r => require.ensure([], r(require('@/docs/test.md')))
    },{
        path: 'test1',
        name: 'test1',
        component: r => require.ensure([], r(require('@/docs/test1.md')))
    }]
    }]
})