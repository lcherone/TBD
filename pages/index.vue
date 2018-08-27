<template>
  <v-app>
    <v-content>
      <v-container fluid tag="section" id="grid">
        <v-layout row wrap>
          <v-flex d-flex xs12 order-xs5>
            <v-layout column>
              <v-flex tag="h1" class="display mb-2">
                <v-layout row wrap>
                  <v-flex xs12 sm6>
                    Dashboard
                  </v-flex>
                  <v-flex xs12 sm6>
                    <!--<v-btn small color="success" @click="dialog = true" style="float:right" :ripple="false">Add User</v-btn>-->
                    <!--<v-btn small color="success" @click="prompt()" style="float:right" :ripple="false">Prompt</v-btn>-->
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex>
                <breadcrumbs></breadcrumbs>
                <alerts></alerts>

                <v-btn small color="success" @click="sendEvent('this is from:' + loggedUser.id)">Send Socket Event</v-btn>
                <v-btn small color="success" @click="getUsers()">Get Users</v-btn>
                <v-btn small color="success" @click="disconnect()">disconnect</v-btn>
                <v-btn small color="success" @click="connect()">connect</v-btn>
                <pre>{{ log }}</pre>
                
                <pre>{{ users }}</pre>
                
                <!--<v-alert type="error" :value="error.global">-->
                <!--  {{ error.global }}-->
                <!--</v-alert>-->
                <!--<v-data-table :headers="tableHeaders" :items="items" hide-actions class="elevation-1" :loading="tableLoading">-->
                <!--  <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>-->
                <!--  <template slot="items" slot-scope="props">-->
                <!--    <td>-->
                <!--      <nuxt-link :to="{ params: { id: props.item.id }, path: `/users/${props.item.id}`}">-->
                <!--        {{ props.item.username || '-' }}-->
                <!--      </nuxt-link>-->
                <!--    </td>-->
                <!--    <td>{{ props.item.login_last !== '0000-00-00 00:00:00' ? new Date(props.item.login_last).toLocaleString() : '-' }}</td>-->
                <!--    <td>{{ props.item.login_count || '0' }}</td>-->
                <!--    <td class="justify-center layout px-0">-->
                <!--      <v-tooltip left>-->
                <!--        <v-btn slot="activator" icon class="mx-0" @click="editItem(props.item)">-->
                <!--          <v-icon color="teal">edit</v-icon>-->
                <!--        </v-btn>-->
                <!--        <span>Edit</span>-->
                <!--      </v-tooltip>-->
                <!--      <v-tooltip left>-->
                <!--        <v-btn slot="activator" icon class="mx-0" @click="deleteItem(props.item)">-->
                <!--          <v-icon color="pink">delete</v-icon>-->
                <!--        </v-btn>-->
                <!--        <span>Delete</span>-->
                <!--      </v-tooltip>-->
                <!--    </td>-->
                <!--  </template>-->
                <!--  <template slot="no-data">-->
                <!--    You have not added any users.-->
                <!--  </template>-->
                <!--</v-data-table>-->

              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import { mapGetters } from 'vuex'
  import axios from '~/plugins/axios'
  import socket from '~/plugins/socket.io/plugin'

  export default {
    head () {
      return {
        title: 'Dashboard'
      }
    },
    middleware: 'authenticated',
    computed: {
      ...mapGetters({
        isAuthenticated: 'auth/isAuthenticated',
        loggedUser: 'auth/loggedUser',
        loggedToken: 'auth/loggedToken'
      })
    },
    data: () => ({
      error: { danger: false, warning: false },
      log: [],
      users: {}
    }),
    mounted: function () {
      axios.defaults.headers.common['authorization'] = this.loggedToken

      this.$breadcrumbs.set([
        { text: 'Dashboard', disabled: false, to: '/' }
      ])

      // let server know where I am & what to do when others are on this page
      socket.event.$emit('location', { name: this.$route.name, action: 'index', id: 0 })
      socket.event.$off('user/multi_tabs').$on('user/multi_tabs', data => {
        this.$alert.hide('info')
        if (data === true) {
          this.$alert.show('info', 'Please close other browser windows or tabs.')
        }
      })
      socket.event.$off('user/other_user').$on('user/other_user', data => {
        this.$alert.hide('danger')
        if (data) {
          this.$alert.show('other_user', data)
        }
      })

      // this.$io.socket.emit('location', { name: this.$route.name, action: 'index', id: 0 })
      /*
      this.$io.socket.on('connect', function () {})
      this.$io.socket.on('an event', function (data) {
        console.log(data)
      })

      */
      this.wsEvents()
      this.initialize()
    },
    methods: {
      async initialize () {
        this.connect()
        this.getUsers()
        // let { data } = await axios.get('/api/dat')
        // console.log(data)

        // setInterval(() => {
        //   this.$io.socket.emit('user/test', 'from client side')
        // }, 3000)
      },
      wsEvents () {
        // let server know where I am
        // this.$io.socket.emit('location', { name: this.$route.name, action: 'index', id: 0 })
        // [result/users] update model

        // user signed in
        this.$io.socket.off('user/sign-in').on('user/sign-in', (data) => {
          console.log('User ' + data + ' signed in')
          // this.$io.socket.emit('users', {})
        })
        this.$io.socket.off('user/sign-out').on('user/sign-out', (data) => {
          // console.log('User ' + data + ' signed out')
          // this.$io.socket.emit('users', {})
        })
        // user connected
        this.$io.socket.off('user/connected').on('user/connected', (data) => {
          // this.$io.socket.emit('users', {})
        })

        // [users] result from server
        this.$io.socket.off('result/test').on('result/test', function (data) {
          // emit that user just signed out
          console.log(data)
        })

        // this.$io.socket.send('foo', { id: this.loggedUser.id })
        // this.$io.socket.send('bar', { id: this.loggedUser.id })
        // this.$io.socket.send('baz', { id: this.loggedUser.id })
        /*
        this.$io.socket.on('disconnect', function () {
          // emit that user just signed out
          this.$io.emit('user/sign-out', { id: this.loggedUser.id })
        })
        */
      },
      sendEvent (value) {
        this.$io.socket.emit('test', value)
      },
      getUsers (value) {
        this.$io.socket.emit('users', value)
      },
      disconnect (value) {
        this.$io.socket.close()
      },
      connect (value) {
        this.$io.socket.connect()
      }
    }
  }
</script>

<style>

</style>
