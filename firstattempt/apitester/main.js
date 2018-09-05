$(document).ready( () => {
    $("#go").click( () => {
        $.ajax({
            headers: {
                "Content-Type": "applcation/json"
            },
            url: "https://api.challonge.com/v1/tournaments/TEAMWP1/matches.json",
            method: "GET",
            dataType: "json",
            data: {
                api_key: apiKey
            },
            success: result => {
                console.log(result);
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    });
});