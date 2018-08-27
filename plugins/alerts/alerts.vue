<template>
  <div>
    <v-alert type="info" :value="state.other_user">
      <span v-if="state.other_user">Another user [{{ state.other_user.data.handle }}] is also viewing this page. <a @click="openChat(state.other_user.id)">Click here</a> to open a chat.</span>
    </v-alert>
    <!--<v-alert type="error" :value="state.danger" v-html="state.danger"></v-alert>-->
    <!--<v-alert type="warning" :value="state.warning" v-html="state.warning"></v-alert>-->
    <!--<v-alert type="info" :value="state.info" v-html="state.info"></v-alert>-->
    <!--<v-alert type="success" :value="state.success" v-html="state.success"></v-alert>-->
    <v-bottom-sheet v-model="chat">
      <v-layout row>
        <v-flex xs12>
          <v-card>
            <pre>{{ chat_user }}</pre>
            <pre>{{ chat_messages }}</pre>
            <v-text-field v-model="chat_message" label="Message" required></v-text-field>
            <v-btn @click="submit_message()">submit</v-btn>
          </v-card>
        </v-flex>
      </v-layout>
    </v-bottom-sheet>
  </div>
</template>

<script>
  import alerts from '~/plugins/alerts/alerts'
  import socket from '~/plugins/socket.io/plugin'

  export default {
    computed: {},
    data: () => ({
      chat: false,
      chat_messages: [],
      chat_message: '',
      chat_user: '',
      state: {
        danger: false,
        warning: false,
        info: false,
        success: false,
        // special alert (as has event handler)
        other_user: false
      }
    }),
    beforeMount () {
      alerts.event.$on('open', (type, message) => {
        this.state[type] = message
      })
      alerts.event.$on('close', type => {
        this.state[type] = false
      })
      socket.event.$off('chat/open/recv').$on('chat/open/recv', data => {
        this.chat = true
        this.chat_user = data.id
        this.chat_messages = []
      })
      socket.event.$off('chat/message/recv').$on('chat/message/recv', data => {
        this.chat = true
        this.chat_messages.push(data)
      })
    },
    methods: {
      openChat (userId) {
        this.chat = true
        this.chat_user = userId
        socket.event.$emit('chat/open', userId)
      },
      submit_message () {
        this.chat_messages.push({ id: this.chat_user, message: this.chat_message, date: new Date() })
        socket.event.$emit('chat/message', { user: this.chat_user, message: this.chat_message })
        this.chat_message = ''
      }
    }
  }
</script>

<style>

</style>
