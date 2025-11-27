<template>
  <div class="pagination" v-if="totalPages > 1">
    <button class="page-btn" :disabled="!hasPrev" @click="changePage(currentPage - 1)">
      ← 上一页
    </button>
    <div class="page-numbers">
      <span v-for="(page, index) in displayPages" :key="index" class="page-num"
        :class="{ 'active': page === currentPage, 'ellipsis': page === '...' }"
        @click="page !== '...' && changePage(page)">
        {{ page }}
      </span>
    </div>
    <button class="page-btn" :disabled="!hasNext" @click="changePage(currentPage + 1)">
      下一页 →
    </button>
  </div>
</template>

<script>
export default {
  name: 'AppPagination',
  props: {
    // 当前页码
    currentPage: {
      type: Number,
      required: true,
      default: 1
    },
    // 总页数
    totalPages: {
      type: Number,
      required: true,
      default: 1
    },
    // 是否有下一页
    hasNext: {
      type: Boolean,
      default: false
    },
    // 是否有上一页
    hasPrev: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 计算要显示的页码
    displayPages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage

      if (total <= 7) {
        // 总页数小于等于7，全部显示
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // 总是显示第一页
        pages.push(1)

        if (current > 3) {
          pages.push('...')
        }

        // 当前页附近的页码
        const start = Math.max(2, current - 1)
        const end = Math.min(total - 1, current + 1)

        for (let i = start; i <= end; i++) {
          pages.push(i)
        }

        if (current < total - 2) {
          pages.push('...')
        }

        // 总是显示最后一页
        pages.push(total)
      }

      return pages
    }
  },
  methods: {
    changePage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) return
      this.$emit('page-change', page)
    }
  }
}
</script>

<style scoped>
/* 分页组件 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding: 20px 0;
}

.page-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-num {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.page-num:hover:not(.active):not(.ellipsis) {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.page-num.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-weight: bold;
}

.page-num.ellipsis {
  cursor: default;
  color: #999;
}

/* 暗色主题适配 */
.dark-theme .page-num {
  color: #aaa;
}

.dark-theme .page-num:hover:not(.active):not(.ellipsis) {
  background: rgba(102, 126, 234, 0.2);
  color: #a29bfe;
}

.dark-theme .page-btn:disabled {
  background: #555;
  color: #888;
}
</style>
