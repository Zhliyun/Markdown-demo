<template>
	<div id="app">
		<div id="nav">
			<router-link to="/markdown">Markdown</router-link>
		</div>
		<router-view/>
	</div>
</template>

<style lang="scss" scoped>
#nav {
	padding: 30px;
	a {
		font-weight: bold;
		color: #2c3e50;
		&.router-link-exact-active {
			color: #42b983;
		}
	}
}
</style>
