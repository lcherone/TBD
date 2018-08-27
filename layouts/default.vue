<template>
  <v-app>
    <navigation/>
    <nuxt/>
    <prompt/>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import navigation from '~/components/navigation.vue'
import socket from '~/plugins/socket.io'

export default {
  components: {
    navigation
  },
  middleware: 'authenticated',
  computed: {
    ...mapGetters({
      loggedToken: 'auth/loggedToken'
    })
  },
  created () {
    socket({ jwt: this.loggedToken, route: this.$route })
  }
}
</script>

<style>

</style>
