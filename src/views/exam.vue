<template>
    <!-- 顶部进度条 -->
    <div id="progressBar"></div>
    <div class="main-panel">
        <!-- 左侧：出题配置 -->
        <div class="left-panel">
            <h1 class="title">课堂练习生成器</h1>

            <div class="form-group">
                <label class="form-label">题目难度</label>
                <div class="difficulty-group">
                    <div class="difficulty-item" :class="{ 'active': difficulty === '简单' }" @click="difficulty = '简单'">
                        简单
                    </div>
                    <div class="difficulty-item" :class="{ 'active': difficulty === '中等' }" @click="difficulty = '中等'">
                        中等
                    </div>
                    <div class="difficulty-item" :class="{ 'active': difficulty === '困难' }" @click="difficulty = '困难'">
                        困难
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">生成题目数量</label>
                <input type="number" id="questionNum" class="num-input" v-model="questionNum" min="1" max="20">
            </div>

            <div class="form-group">
                <label class="form-label">本堂课程知识点</label>
                <textarea v-model="knowledge" id="knowledge"
                    placeholder="请输入本节课的知识点，例如：Java 变量、数据类型、运算符、流程控制语句..."></textarea>
            </div>

            <div class="btn-group">
                <button class="btn-submit" id="submitBtn" @click="createExercise">提交生成</button>
                <button class="btn-clear" id="clearBtn">清空内容</button>
            </div>
            <div id="qrCode">
                <img :src="qrCode"/>
            </div>
        </div>

        <!-- 右侧：考卷展示 -->
        <div class="right-panel">
            <div class="paper-title">课堂练习考卷</div>
            <div class="knowledge" id="knowledgeText">{{ statusText }}</div>
            <div id="questionList">
                <div class="question-item" v-for="(one, index) in exercise.questions">
                    <div class="question-title">{{ index + 1 }}. {{ one.question }}</div>
                    <div class="options">
                        <div class="option-item" v-for="(opt, optIndex) in one.options">
                            <input type="radio" name="question${index}" value="${opt.key}">
                            <span>【{{ opt.key }}】 {{ opt.value }}</span>
                        </div>
                    </div>
                    <button class="btn-show" @click="showAnswer(one)">查看答案与解析</button>
                    <div class="answer-section" v-if="one.showAnswer">
                        <div class="correct-answer">正确答案：{{ one.answer }}</div>
                        <div class="explanation">解析：{{ one.explanation }}</div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import $ from 'jquery'
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const difficulty = ref('简单')
const questionNum = ref(5)
const knowledge = ref('')
const paperTitle = ref('课堂练习考卷')
const statusText = ref('等待生成题目...')
const questionList = ref([])
let isRequesting = false;
const exercise = ref({})
const qrCode = ref('')

// 进度条控制
function startProgress() {
    $("#progressBar").css("width", "90%");
    $("#submitBtn").prop("disabled", true);
    isRequesting = true;
}
function finishProgress() {
    $("#progressBar").css("width", "100%");
    setTimeout(() => {
        $("#progressBar").css("width", "0%");
        $("#submitBtn").prop("disabled", false);
        isRequesting = false;
    }, 300);
}

function createExercise(){
	if(!knowledge.value){
		alert("请输入本堂课程知识点");
		return;
	}
	startProgress()
	let data={
		"difficulty":difficulty.value,
		"questionNum":questionNum.value,
		"knowledge":knowledge.value,
	}
	proxy.$http("/exercise/createExercise","POST",data,true,function(resp){
		statusText.value="生成完成";
		exercise.value=resp.data.content
		qrCode.value=resp.data.base64
		finishProgress()
	})
}

function showAnswer(item){
	if(!item.showAnswer){
		item.showAnswer=false;
	}
	item.showAnswer=!item.showAnswer;
}

</script>
<style lang="scss" scoped>
@use "exam";
</style>