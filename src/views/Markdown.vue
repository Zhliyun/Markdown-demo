<template>
	<div class="about">
		<h1>This is an markdown page</h1>
		<ul>
			<li v-for="file of markdownList" :key="file">
				<router-link :to="`/markdown/${file}`">{{ file }}</router-link>
			</li>
		</ul>
		<router-view/>
	</div>
</template>

<script>
import markdownList from '@/docs/markdown-list.json'

export default {
	data() {
		return {
			markdownList: markdownList.markdownList
		}
	},
	created() {
		console.log(this.markdownList)
	}
}
</script>
