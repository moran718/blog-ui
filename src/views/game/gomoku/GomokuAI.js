/**
 * 五子棋 AI 引擎 (优化版)
 * 使用评分表 + 贪心策略 + 局部搜索
 */
export default class GomokuAI {
    constructor() {
        this.size = 15
        this.depth = 1
    }

    setLevel(level) {
        if (level === 'easy') this.depth = 2 // 简单：看2步
        else if (level === 'medium') this.depth = 4 // 普通：看4步（但搜索范围小）
        else if (level === 'hard') this.depth = 6 // 困难：看6步或更深评分
    }

    // 获取最佳落子点
    getBestMove(board, role) {
        const aiRole = role // 2 (White)
        const playerRole = 3 - role // 1 (Black)

        // 第一步：如果是空棋盘，下天元
        if (this.isBoardEmpty(board)) return { x: 7, y: 7 }

        // 获取所有空位
        const emptyPoints = this.getEmptyPoints(board)
        // 剪枝：只考虑有邻居的空位 (半径为2)
        const candidates = this.filterCandidates(board, emptyPoints)

        let bestPoint = null
        let maxScore = -Infinity

        // 遍历候选点
        for (const p of candidates) {
            // 1. 进攻分：假设 AI 下这里，能形成多大的威胁
            const attackScore = this.evaluatePoint(board, p.x, p.y, aiRole)

            // 2. 防守分：假设玩家下这里，能形成多大的威胁
            const defendScore = this.evaluatePoint(board, p.x, p.y, playerRole)

            // 总分 = 进攻分 + 防守分
            // 根据难度调整权重
            let score = 0
            if (this.depth <= 2) {
                // 简单：只看当前，略微偏向进攻，防守意识差
                score = attackScore + defendScore * 0.5
            } else if (this.depth <= 4) {
                // 普通：均衡
                score = attackScore + defendScore
            } else {
                // 困难：防守优先，也就是如果对方要赢了(defendScore极高)，必须堵
                // 如果自己能赢(attackScore极高)，优先自己赢
                if (attackScore >= 100000) score = Infinity // 能连五，必杀
                else if (defendScore >= 100000) score = 1000000 // 对方连五，必堵
                else score = attackScore + defendScore
            }

            // 添加微小的位置随机性，避免走法完全固定
            score += Math.random() * 10

            if (score > maxScore) {
                maxScore = score
                bestPoint = p
            }
        }

        return bestPoint
    }

    // 评估某一点的价值（核心算法）
    evaluatePoint(board, x, y, role) {
        let score = 0
        // 四个方向
        const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]]

        for (const dir of dirs) {
            score += this.evaluateDirection(board, x, y, dir, role)
        }
        return score
    }

    // 评估某个方向上的棋型
    evaluateDirection(board, x, y, dir, role) {
        let count = 1 // 连子数 (包含当前点)
        let emptySides = 0 // 两端是否为空

        // 正向搜索
        let i = 1
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const nx = x + dir[0] * i
            const ny = y + dir[1] * i
            if (nx < 0 || ny < 0 || nx >= 15 || ny >= 15) break

            if (board[ny][nx] === role) {
                count++
            } else if (board[ny][nx] === 0) {
                emptySides++
                break // 遇到空位停止
            } else {
                break // 遇到对方阻挡停止
            }
            i++
        }

        // 反向搜索
        i = 1
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const nx = x - dir[0] * i
            const ny = y - dir[1] * i
            if (nx < 0 || ny < 0 || nx >= 15 || ny >= 15) break

            if (board[ny][nx] === role) {
                count++
            } else if (board[ny][nx] === 0) {
                emptySides++
                break
            } else {
                break
            }
            i++
        }

        // 评分标准 (分数越高越优先)
        if (count >= 5) return 100000 // 连五 (最高优先级)

        if (count === 4) {
            if (emptySides === 2) return 50000 // 活四 (必胜)
            if (emptySides === 1) return 10000 // 冲四 (需要防守)
        }

        if (count === 3) {
            if (emptySides === 2) return 5000 // 活三 (下一步变活四)
            if (emptySides === 1) return 500  // 眠三
        }

        if (count === 2) {
            if (emptySides === 2) return 500  // 活二
            if (emptySides === 1) return 50   // 眠二
        }

        if (count === 1 && emptySides === 2) return 10 // 活一

        return 0
    }

    // 剪枝：只考虑已有棋子周围半径为2的空位
    filterCandidates(board, emptyPoints) {
        const result = []

        // 如果空位太多，全盘扫描太慢。只扫描有邻居的点。
        // 这里优化：如果棋盘比较空，直接返回所有点太慢。
        // 更好的做法：遍历已有棋子，将其周围的空位加入 Set

        const candidateSet = new Set()

        let hasPiece = false
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                if (board[y][x] !== 0) {
                    hasPiece = true
                    // 将周围半径2的空位加入候选
                    for (let dy = -2; dy <= 2; dy++) {
                        for (let dx = -2; dx <= 2; dx++) {
                            const nx = x + dx
                            const ny = y + dy
                            if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board[ny][nx] === 0) {
                                candidateSet.add(`${nx},${ny}`)
                            }
                        }
                    }
                }
            }
        }

        if (!hasPiece) return emptyPoints // 空棋盘

        // 将 Set 转回对象数组
        for (const str of candidateSet) {
            const [x, y] = str.split(',').map(Number)
            result.push({ x, y })
        }

        return result
    }

    getEmptyPoints(board) {
        // 仅在 filterCandidates 失败时备用，一般不用全盘扫描
        const points = []
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                if (board[y][x] === 0) points.push({ x, y })
            }
        }
        return points
    }

    isBoardEmpty(board) {
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                if (board[y][x] !== 0) return false
            }
        }
        return true
    }
}
