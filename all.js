const { createApp } = Vue;
let ticketModal = null;
let deleteModal = null;

const Api = 'http://219.85.163.90:5000'

createApp({
    data() {
        return {
            tickets: [],
            tempTicket: {},
            stations: [],
            isNewTicket: true,
        }
    },
    methods: {
        getStations(){
            const getStationsApi = `${Api}/redeemdb/charging_toon/stations`;
            axios
            .get(getStationsApi)
            .then((response) => {
                this.stations = response.data;
            })
        },
        getInfos() {
            const getInfosApi = `${Api}/charging_toon/carIn`;
            axios
                .get(getInfosApi)
                .then((response) => {
                    this.tickets = response.data;
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
                axios
                    .post(updateTicketApi, { target: this.tempTicket })
                    .then((response) => {
                        alert(response.data.message)
                        this.getInfos();
                    })
                ticketModal.hide();
            } else {
                updateTicketApi = `${Api}/charging_toon/updatePlate/${this.tempTicket.id}`;
                axios
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
            axios
                .put(deleteTicketApi)
                .then((response) => {
                    deleteModal.hide();
                    alert(response.data.message);
                    this.getInfos();
                });
        }
    },
    mounted() {
        this.getStations();
        this.getInfos();
        setInterval(() => this.getInfos(), 5000);
        ticketModal = new bootstrap.Modal('#ticketModal');
        deleteModal = new bootstrap.Modal('#deleteModal');
    }
}).mount('#app')