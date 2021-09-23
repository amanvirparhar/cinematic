const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

const fetch = require("node-fetch");
const scrapper = require("imdb-scrapper");
const scrapeYt = require("scrape-yt").scrapeYt;

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    var msg = message.content.toLowerCase();

    if (msg.startsWith(`${prefix}info`)) {
        msg = msg.slice(7);
        var url = "https://v2.sg.media-imdb.com/suggests/" + msg.charAt(0) + "/" + msg + ".json";

        fetch(url)
            .then(datault => datault.text())
            .then(info);
    }

    if (msg.startsWith(`${prefix}actor`)) {
        msg = msg.slice(8);
        var url = "https://v2.sg.media-imdb.com/suggests/" + msg.charAt(0) + "/" + msg + ".json";

        fetch(url)
            .then(datault => datault.text())
            .then(actor);
    }

    function info(datault) {
        var deets;
        deets = datault.substring(datault.indexOf("{"));
        deets = deets.slice(0, -1);
        deets = JSON.parse(deets);

        var thumbnail = "";

        for (i = 0; i < deets.d.length; i++) {
            if (deets.d[i].q != undefined) {
                message.channel.send("Gathering results for your search :mag:").then((msg) => {
                    setTimeout(() => {
                        msg.delete();
                    }, 3000)
                })

                scrapper.getFull(deets.d[0].id)
                    .then(data => {
                        if (Math.round(data.rating / 2) == 1) {
                            thumbnail = "https://i.ibb.co/0Jr2wWB/5-stars-4.png";
                        } else if (Math.round(data.rating / 2) == 2) {
                            thumbnail = "https://i.ibb.co/0KkdgBf/5-stars-3.png";
                        } else if (Math.round(data.rating / 2) == 3) {
                            thumbnail = "https://i.ibb.co/G21TXp9/5-stars-2.png";
                        } else if (Math.round(data.rating / 2) == 4) {
                            thumbnail = "https://i.ibb.co/Prkdjvh/5-stars-1.png";
                        } else if (Math.round(data.rating / 2) == 5) {
                            thumbnail = "https://i.ibb.co/y07YWSQ/5-stars.png";
                        }

                        scrapeYt.search(deets.d[i].l + " Trailer", {
                            type: "video"
                        }).then(videos => {
                            const deetsEmbed = new Discord.MessageEmbed()
                                .setTitle(deets.d[i].l + " (" + deets.d[i].y + ")")
                                .setThumbnail(thumbnail)
                                .addFields(
                                    { name: 'Starring', value: deets.d[i].s, inline: true },
                                    { name: 'Runtime', value: data.runtime, inline: true },
                                    { name: 'Nominations', value: data.awards[0].name + "⠀", inline: true },
                                    { name: 'Trailer', value: "[youtu.be/" + videos[0].id + "](https://youtu.be/" + videos[0].id + " 'optional hovertext')" },
                                    { name: 'Plot', value: data.story },
                                )
                                .setImage(deets.d[i].i[0])
                            message.channel.send(deetsEmbed);
                        });
                    });
                break;
            }
        }
    }

    function actor(datault) {
        var deets;
        deets = datault.substring(datault.indexOf("{"));
        deets = deets.slice(0, -1);
        deets = JSON.parse(deets);
        
        for (i = 0; i < deets.d.length; i++) {
            if (!deets.d[i].hasOwnProperty('q')) {
                message.channel.send("Gathering results for your search :mag:").then((msg) => {
                    setTimeout(() => {
                        msg.delete();
                    }, 3000)
                })

                scrapper.getActor(deets.d[0].id)
                    .then(data => {
                        scrapeYt.search(data[0].actorName + " Interview", {
                            type: "video"
                        }).then(videos => {
                            console.log(data);
                            const deetsEmbed = new Discord.MessageEmbed()
                                .setTitle(data[0].actorName)
                                .addFields(
                                    { name: 'Profession', value: deets.d[i].s },
                                    { name: 'Background', value: data[0].actorInfo },
                                    { name: 'Interview', value: "[youtu.be/" + videos[0].id + "](https://youtu.be/" + videos[0].id + " 'optional hovertext')" },
                                )
                                .setImage(deets.d[i].i[0])
                            message.channel.send(deetsEmbed);
                        });
                    });
                break;
            }
        }
    }
});

client.login(token);