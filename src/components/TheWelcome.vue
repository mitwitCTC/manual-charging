<script>
let ticketModal = null;
let deleteModal = null;
const Api = 'http://219.85.163.90:5000';
import base64 from 'base64-js';

export default {
  data() {
    return {
      tickets: [],
      tempTicket: {},
      stations: [],
      isNewTicket: true,
      isLoading: true,
      companyId: '',
      isEncoded: true,
    }
  },
  methods: {
    getStations() {
      // this.decryptedId();
      const getStationsApi = `${Api}/redeemdb/charging_toon/stations`;
      this.$http
        .post(getStationsApi, { target: { companyId: this.companyId } })
        .then((response) => {
          this.stations = response.data;
        })
    },
    getInfos() {
      // this.decryptedId();
      const getInfosApi = `${Api}/charging_toon/carIn`;
      this.$http
        .post(getInfosApi, { target: { companyId: this.companyId } })
        .then((response) => {
          this.tickets = response.data;
          this.isLoading = false;
          this.getOrganizeTickets();
        })
    },
    openTicketModal(status, ticket) {
      ticketModal.show();
      if (status === 'create') {
        this.isNewTicket = true;
        this.tempTicket = {};
      } else if (status === 'edit') {
        this.isNewTicket = false;
        this.tempTicket = JSON.parse(JSON.stringify(ticket));
      }
    },
    updateTicket() {
      let updateTicketApi = `${Api}/charging_toon/createCarIn`;
      if (this.isNewTicket) {
        if (this.tempTicket.ArrivalTime !== null || this.tempTicket.ArrivalTime != "" || this.tempTicket.ArrivalTime !== undefined) {
          this.tempTicket.ArrivalTime = this.tempTicket.ArrivalTime.split('T')[0] + ' ' + this.tempTicket.ArrivalTime.split('T')[1];
        };
        this.$http
          .post(updateTicketApi, { target: this.tempTicket })
          .then((response) => {
            alert(response.data.message)
            this.getInfos();
          })
        ticketModal.hide();
      } else {
        updateTicketApi = `${Api}/charging_toon/updatePlate/${this.tempTicket.id}`;
        this.$http
          .put(updateTicketApi, { target: this.tempTicket })
          .then((response) => {
            alert(response.data.message);
            this.getInfos();
          })
        ticketModal.hide();
      }
    },
    openDeleteModal(ticket) {
      deleteModal.show();
      this.tempTicket = JSON.parse(JSON.stringify(ticket));
    },
    deleteTicket() {
      let deleteTicketApi = `${Api}/charging_toon/deleteCarIn/${this.tempTicket.id}`;
      this.$http
        .put(deleteTicketApi)
        .then((response) => {
          deleteModal.hide();
          alert(response.data.message);
          this.getInfos();
        });
    },
    initModal() {
      ticketModal = new bootstrap.Modal('#ticketModal');
      deleteModal = new bootstrap.Modal('#deleteModal');
    },
    // decryptedId() {
    //   // 解碼路由參數
    //   this.companyId = atob(this.$route.params.c);
    // },
    getOrganizeTickets() {
      // 整合場站名稱至在場資訊列表
      this.stations.forEach(itemA => {
        // 查找所有匹配的項目
        const matchingItemsB = this.tickets.filter(itemB => itemA.id === itemB.stationId);
        // 將每个匹配的項目添加到在場資訊列表中
        matchingItemsB.forEach(matchingItemB => {
          matchingItemB.name = itemA.name;
          matchingItemB.isEVCharging = itemA.isEVCharging;
        });
      });
    },
  },
  mounted() {
    this.getStations();
    this.getInfos();
    setInterval(() => this.getInfos(), 5000);
    this.initModal();
  },
  created() {
    this.companyId = atob(this.$route.params.c)
  }
}
</script>

<template>
  <div id="app">
    <div class="container">
      <div v-if="isLoading" class="loading">
        <img src="../assets/loading.svg" alt="">
      </div>
      <table v-else class="table table-hover text-center mt-3">
        <thead>
          <tr class="h2">
            <th scope="col">場站 Id</th>
            <th scope="col">場站名稱</th>
            <th scope="col">車位</th>
            <th scope="col">車號</th>
            <th scope="col">入場時間</th>
            <th scope="col"><button type="button" class="btn btn-warning" data-bs-toggle="modal"
                data-bs-target="#ticketModal" @click="openTicketModal('create')">新增</button>
            </th>
          </tr>
        </thead>
        <tbody v-if="tickets.length > 0">
          <tr v-for="ticket in tickets" :key="ticket.id" class="fs-4">
            <th scope="row">{{ ticket.stationId }}</th>
            <td>{{ ticket.name }}</td>
            <td>{{ ticket.spaceId }}</td>
            <td>{{ ticket.checkPlate }}</td>
            <td>{{ ticket.ArrivalTime }}</td>
            <td>
              <a href="#"><img src="../assets/edit.png" alt="edit" style="width: 25px;" data-bs-toggle="modal"
                  data-bs-target="#ticketModal" @click="openTicketModal('edit', ticket)"></a>
              <a href="#"><img src="../assets/delete.png" alt="delete" style="width: 25px; margin-left: 25px;"
                  data-bs-toggle="modal" data-bs-target="#deleteModal" @click="openDeleteModal(ticket)"></a>
            </td>
          </tr>
        </tbody>
        <tbody v-else class="h2">
          <td colspan="6">目前無資料</td>
        </tbody>
      </table>

      <!-- Modal -->
      <div class="modal fade" id="ticketModal" tabindex="-1" aria-labelledby="ticketModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-warning">
              <h5 class="modal-title" id="ticketModalLabel">{{ isNewTicket ? '新增開票' : '編輯' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="myForm" v-if="isNewTicket" @submit.prevent="updateTicket">
                <div class="form-floating mb-3">
                  <select class="form-select" id="floatingSelect" aria-label="Floating label select example" required
                    v-model="tempTicket.stationId">
                    <option disabled>請選擇場站名稱</option>
                    <option v-for="station in stations" :value="station.id">{{
                      station.name }}</option>
                  </select>
                  <label for="floatingSelect">請選擇場站名稱</label>
                </div>

                <div class="form-floating mb-3">
                  <input type="number" class="form-control" id="floatingInput" v-model="tempTicket.spaceId" required>
                  <label for="floatingInput">請輸入車位號</label>
                </div>

                <div class="form-floating mb-3">
                  <input type="text" class="form-control" id="floatingInput" v-model="tempTicket.checkPlate" required>
                  <label for="floatingInput">請輸入車號</label>
                </div>

                <div class="form-floating mb-3">
                  <input type="datetime-local" class="form-control" id="floatingInput" step="1"
                    v-model="tempTicket.ArrivalTime" required>
                  <label for="floatingInput">請輸入入場時間</label>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
                  <button type="submit" id="submitButton" class="btn btn-warning">確認</button>
                </div>
              </form>
              <form id="myForm" v-else>
                <div class="form-floating mb-3">
                  <select class="form-select" id="floatingSelect" aria-label="Floating label select example" required
                    v-model="tempTicket.stationId" disabled>
                    <option disabled>請選擇場站名稱</option>
                    <option v-for="station in stations" :value="station.id">{{ station.name }}</option>
                  </select>
                  <label for="floatingSelect">請選擇場站名稱</label>
                </div>

                <div class="form-floating mb-3">
                  <input type="number" class="form-control" id="floatingInput" v-model="tempTicket.spaceId" required
                    disabled>
                  <label for="floatingInput">請輸入車位號</label>
                </div>

                <div class="form-floating mb-3">
                  <input type="text" class="form-control" id="floatingInput" v-model="tempTicket.checkPlate" required>
                  <label for="floatingInput">請輸入車號</label>
                </div>

                <div class="form-floating mb-3">
                  <input type="datetime-local" class="form-control" id="floatingInput" step="1"
                    v-model="tempTicket.ArrivalTime" required disabled>
                  <label for="floatingInput">請輸入入場時間</label>
                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
                  <button type="submit" id="submitButton" class="btn btn-warning" @click="updateTicket">確認</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-warning">
              <h5 class="modal-title" id="ticketModalLabel">確認刪除</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="myDeleteForm" @submit.prevent="deleteTicket">
                <p v-if="tempTicket.stationId == 1">場站：<span>測試</span></p>
                <p v-if="tempTicket.stationId == 396">場站：<span>正心</span></p>
                <p v-if="tempTicket.stationId == 260">場站：<span>林森</span></p>
                <p v-if="tempTicket.stationId == 433">場站：<span>南屯五權</span></p>
                <p>車號：<span>{{ tempTicket.checkPlate }}</span></p>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
                  <button type="submit" id="submitButton" class="btn btn-warning">確認</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.loading {
  position: absolute;
  top: 50%;
  right: 50%;
}
</style>