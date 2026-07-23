<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="app-icon">📱</div>
        <h1>Admin Portal</h1>
        <p>后台管理系统 · 安全登录</p>
      </div>

      <van-form @submit="handleLogin">
        <!-- 用户名 -->
        <van-field
          v-model="formData.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名 / 手机号"
          :rules="[{ required: true, message: '请输入用户名' }]"
          left-icon="user-o"
          clearable
          autocomplete="username"
        />

        <!-- 密码 -->
        <van-field
          v-model="formData.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
          left-icon="lock-o"
          clearable
          autocomplete="current-password"
        />

        <!-- 图形验证码 -->
        <div class="captcha-wrapper">
          <van-field
            v-model="formData.code"
            name="captcha"
            label="验证码"
            placeholder="请输入图形验证码"
            :rules="[{ required: true, message: '请输入验证码' }]"
            left-icon="certificate-o"
            clearable
            maxlength="6"
            class="captcha-input"
          />
          <div class="captcha-img" @click="refreshCaptcha">
             <img :src="`data:image/gif;base64,${ codeImg }`" alt="" v-if="codeImg">
          </div>
        </div>
        <div class="captcha-tip">点击图片刷新验证码</div>

        <!-- 登录按钮 -->
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          loading-text="登录中..."
          class="login-btn"
        >
          登 录
        </van-button>
      </van-form>

      <div class="footer-tip">
        Demo 演示: admin / 123456
        <span class="hint">（验证码不区分大小写）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { encrypt } from '../utils/aes';
import 'vant/es/toast/style'
import 'vant/es/dialog/style'

const router = useRouter()

// 表单数据
const formData = reactive({
  username: 'admin',
  password: 'admin123',
  code: '',
  uuid: ''
})
// 加载状态
const loading = ref(false)
// 验证码图片
const codeImg = ref('')

// 刷新验证码
const refreshCaptcha = () => {
  captchaImage()
}

// 登录提交
const handleLogin = async () => {
  if (loading.value) {
    return
  }
  if (!formData.username.trim()) {
    showToast({ message: '请输入用户名', icon: 'fail' })
    return
  }
  if (!formData.password.trim()) {
    showToast({ message: '请输入密码', icon: 'fail' })
    return
  }
  if (!formData.code.trim()) {
    showToast({ message: '请输入图形验证码', icon: 'fail' })
    return
  }
  login()
}

// 生成图形验证码
const captchaImage = async () => {
  try {
    const res = await api.get('/captchaImage')
    if (res.code === 200) {
      codeImg.value = res.data.img
      formData.uuid = res.data.uuid
    } else {
      showToast(res.message)
    }
  } catch (e) {
    showToast('系统错误')
  }
}

// 登录系统
const login = async () => {
  try {
    const res = await api.post('/system/auth/login', {
      ...formData,
      password: encrypt(formData.password)
    })
    if (res.code === 200) {
    const { access_token } = res.data
      localStorage.setItem('token', access_token)
      localStorage.setItem('loginInfo', JSON.stringify(res.data))
      router.push('/home')
    } else {
      showToast(res.message)
      refreshCaptcha()
    }
  } catch (e) {
    showToast('系统错误')
  }
}

// 初始化验证码
onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 32px;
  padding: 32px 24px 40px;
  box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.app-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(145deg, #667eea, #764ba2);
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  margin-bottom: 16px;
  box-shadow: 0 8px 16px -6px rgba(102, 126, 234, 0.4);
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1f2f3d;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #7f8c8d;
}

/* 验证码区域 */
.captcha-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  flex-shrink: 0;
  width: 110px;
  height: 48px;
  background: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.captcha-img:active {
  opacity: 0.8;
  transform: scale(0.97);
}

.captcha-img canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.captcha-tip {
  font-size: 12px;
  color: #95a5a6;
  margin-left: 8px;
  margin-bottom: 8px;
}

/* 登录按钮 */
.login-btn {
  margin-top: 24px;
  border-radius: 60px;
  font-weight: 600;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border: none;
  box-shadow: 0 10px 20px -8px rgba(102, 126, 234, 0.4);
}

.footer-tip {
  text-align: center;
  font-size: 13px;
  color: #95a5a6;
  margin-top: 32px;
}

.hint {
  color: #cbd5e0;
  margin-left: 4px;
}

/* Vant 字段圆角优化 */
:deep(.van-field__control) {
  font-size: 15px;
}

:deep(.van-cell) {
  border-radius: 16px;
  background-color: #f8f9fc;
}

@media (max-width: 480px) {
  .login-card {
    padding: 28px 20px 36px;
  }
}
</style>