// import React from 'react'
// import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
// import { Spin } from 'antd'
import Home from '../views/Home'
// import Login from '@/views/Login'
// import Board from '@/views/Board'

// const load = (children: JSX.Element) => {
//   return <Suspense fallback="">{children}</Suspense>
// }

const routeMap = new Map()

const routeList = [
  {
    path: '/',
    element: <Home />
  }
]

const RenderRouter = () => {
  const element = useRoutes(routeList)
  return element
}

const router2map = (rList: any, pUrl: string) => {
  rList.forEach((item: any) => {
    let url = ''
    if (pUrl.endsWith('/') || pUrl.length === 0) {
      url = pUrl + item.path
    } else {
      url = pUrl + '/' + item.path
    }
    if (item.children) {
      router2map(item.children, url)
    } else {
      routeMap.set(`${url}`, item.meta || {})
    }
  })
}

router2map(routeList, '')

export const getCurrentRouter = (currentPath: string) => {
  let item = routeMap.get(currentPath)
  if (item) {
    return item
  } else {
    return null
  }
}

export const routers = routeList
export default RenderRouter
