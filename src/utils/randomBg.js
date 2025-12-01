/**
 * 随机背景图工具
 * 为不同页面生成不同的随机背景图
 */

// 本地图片列表
const localImages = [
  '/image/wallhaven-9oo2k1.jpg',
  '/image/wallhaven-7jp8qy.jpg',
  '/image/wallhaven-2116k9.jpg',
  '/image/wallhaven-391kqv.jpg',
  '/image/wallhaven-mlldj8.jpg',
  '/image/ai-generated-8750157_640.jpg'
]

// 在线随机图 API 列表
const onlineApis = [
  'https://www.dmoe.cc/random.php',
  'https://acg.toubiec.cn/random.php'
]

// 页面背景图缓存，确保同一次会话中不同页面显示不同图片
const pageImageCache = {}

// 已使用的图片索引
let usedLocalIndices = []
let usedApiIndices = []

/**
 * 获取随机背景图
 * @param {string} pageName - 页面名称，如 'home', 'essay', 'record', 'message'
 * @param {boolean} useOnline - 是否使用在线 API，默认 true
 * @returns {string} 背景图 URL
 */
export function getRandomBg(pageName, useOnline = true) {
  // 如果该页面已有缓存，直接返回
  if (pageImageCache[pageName]) {
    return pageImageCache[pageName]
  }

  let bgUrl

  if (useOnline) {
    // 使用在线 API
    // 为每个页面分配不同的 API，并添加唯一参数避免缓存
    const apiIndex = getNextIndex(usedApiIndices, onlineApis.length)
    usedApiIndices.push(apiIndex)
    bgUrl = onlineApis[apiIndex] + '?page=' + pageName + '&t=' + Date.now()
  } else {
    // 使用本地图片
    const imageIndex = getNextIndex(usedLocalIndices, localImages.length)
    usedLocalIndices.push(imageIndex)
    bgUrl = localImages[imageIndex]
  }

  pageImageCache[pageName] = bgUrl
  return bgUrl
}

/**
 * 获取下一个未使用的索引
 */
function getNextIndex(usedIndices, maxLength) {
  // 如果所有都用过了，重置
  if (usedIndices.length >= maxLength) {
    usedIndices.length = 0
  }

  // 找一个未使用的随机索引
  let index
  do {
    index = Math.floor(Math.random() * maxLength)
  } while (usedIndices.includes(index))

  return index
}

/**
 * 获取备用背景图（当主图加载失败时）
 * @param {string} currentUrl - 当前失败的 URL
 * @param {string} pageName - 页面名称
 * @returns {string} 备用图片 URL
 */
export function getFallbackBg(currentUrl, pageName) {
  // 先尝试其他在线 API
  for (const api of onlineApis) {
    if (!currentUrl.includes(api.split('/')[2])) {
      return api + '?page=' + pageName + '&t=' + Date.now()
    }
  }

  // 如果在线都失败了，使用本地图片
  const randomLocal = localImages[Math.floor(Math.random() * localImages.length)]
  return randomLocal
}

/**
 * 清除页面缓存（用于强制刷新背景图）
 * @param {string} pageName - 页面名称，不传则清除所有
 */
export function clearBgCache(pageName) {
  if (pageName) {
    delete pageImageCache[pageName]
  } else {
    Object.keys(pageImageCache).forEach(key => delete pageImageCache[key])
    usedLocalIndices = []
    usedApiIndices = []
  }
}

/**
 * 预加载页面背景图
 * @param {string} pageName - 页面名称
 */
export function preloadBg(pageName) {
  // 如果已缓存，获取缓存的 URL 来预加载
  const bgUrl = getRandomBg(pageName)

  // 创建 Image 对象预加载
  const img = new Image()

  // 记录已尝试过的 URL，避免重复尝试
  const triedUrls = new Set([bgUrl])

  img.onerror = () => {
    console.warn(`背景图加载失败: ${img.src}，尝试备用图片...`)

    // 获取备用图片
    const fallbackUrl = getFallbackBg(img.src, pageName)

    // 如果备用图片没尝试过，则尝试加载
    if (!triedUrls.has(fallbackUrl)) {
      triedUrls.add(fallbackUrl)
      // 更新缓存为备用图片
      pageImageCache[pageName] = fallbackUrl
      img.src = fallbackUrl
    } else {
      // 所有在线 API 都失败了，使用本地图片
      const localImg = localImages[Math.floor(Math.random() * localImages.length)]
      pageImageCache[pageName] = localImg
      img.src = localImg
      console.log(`使用本地备用图片: ${localImg}`)
    }
  }

  img.src = bgUrl

  return bgUrl
}

/**
 * 预加载多个页面的背景图
 * @param {string[]} pageNames - 页面名称数组
 */
export function preloadMultipleBgs(pageNames) {
  pageNames.forEach(name => preloadBg(name))
}

export default {
  getRandomBg,
  getFallbackBg,
  clearBgCache,
  preloadBg,
  preloadMultipleBgs,
  localImages,
  onlineApis
}

