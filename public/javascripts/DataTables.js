$(document).ready(function () {
    $('#resultTable').DataTable({
        // 日本語表示
        "language": {
            "url": "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Japanese.json"
        },
        displayLength: 50
    });
});