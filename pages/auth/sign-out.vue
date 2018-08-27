<template>
  <div></div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { unsetToken } from '~/utils/auth'
  export default {
    head () {
      return {
        title: 'Auth - Sign Out'
      }
    },
    middleware: 'authenticated',
    computed: {
      ...mapGetters({
        loggedUser: 'auth/loggedUser'
      })
    },
    mounted () {
      this.$io.socket.emit('user/sign-out', { id: this.loggedUser.id })
      this.$io.socket.disconnect()
      unsetToken()
      this.$router.replace('/')
    }
  }
</script>

<style>
  html {
    background: #dddddd;
    height: 100%
  }
</style>