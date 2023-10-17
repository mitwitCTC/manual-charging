<template>
    <main>
        <table class="table table-hover text-center mt-3">
            <thead>
                <tr class="h2">
                    <th scope="col">場站 Id</th>
                    <th scope="col">場站名稱</th>
                    <th scope="col">車位</th>
                    <th scope="col">車號</th>
                    <th scope="col">入場時間</th>
                    <th scope="col"><button type="button" class="btn btn-warning" data-bs-toggle="modal"
                            data-bs-target="#ticketModal">新增</button>
                    </th>
                </tr>
            </thead>
        </table>
    </main>
</template>

<script>
// import base64 from 'base64-js';

export default {
    name: 'Transit',
    data(){
        return{
            encryptedParameter: "",
        }
    },
    created(){
        this.encryptedParameter = btoa(this.$route.params.transit);
        this.$router.replace({path: `/charging/${this.encryptedParameter}`})
    }
}
</script>