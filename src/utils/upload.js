import { showToast } from 'vant'

/**
 * 上传文件到服务器
 * @param {File} file - 原生 File 对象
 * @returns {Promise<string>} 返回 filePathUrl
 */
export async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/admin/pinball/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  if (res.code === 200) {
    return res.data.filePathUrl
  }
  throw new Error(res.message || '上传失败')
}

/**
 * van-uploader after-read 回调的通用处理
 * @param {object} detail - after-read 的文件对象
 * @returns {Promise<string>} 返回 filePathUrl
 */
export async function onUploadRead(detail) {
  try {
    const url = await uploadFile(detail.file)
    showToast('上传成功')
    return url
  } catch (e) {
    showToast(e.message || '上传失败')
    return ''
  }
}
