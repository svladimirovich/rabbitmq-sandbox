const messages = document.getElementById('messages');
const queueSize = document.getElementById('queueSize');
const queueConsumerCount = document.getElementById('queueConsumerCount');
const queueState = document.getElementById('queueState');

const ws = new WebSocket(`ws://${location.host}/ws`);

function appendMessage(value) {
    const messageBlock = document.createTextNode(value);
    const endlineElement = document.createElement("br");
    messages.prepend(endlineElement);
    messages.prepend(messageBlock);
}

function createPlatformIcon(platform) {
    const platformIcon = document.createElement("img");
    platformIcon.classList.add('platform');
    platformIcon.setAttribute('src', `icons/${platform}.svg`);
    platformIcon.setAttribute('align', 'center');
    platformIcon.width = 20;
    platformIcon.height = 20;
    return platformIcon;
}

function createPlatformSpan(platform, cssClass, title, host) {
    const result = document.createElement("span");
    result.classList.add(cssClass);
    if (title) {
        result.append(document.createTextNode(title));
    }
    result.append(createPlatformIcon(platform));
    const hostSpan = document.createElement("span");
    hostSpan.classList.add('host');
    hostSpan.append(document.createTextNode(host));
    result.append(hostSpan);
    return result;
}

function getDurationSpan(job) {
    const createDate = moment(job.createDate);
    const executionDate = moment(job.executionDate);
    const duration = moment.duration(executionDate.diff(createDate));
    const result = document.createElement("span");
    result.classList.add("duration");
    let durationText = '';
    if (duration.minutes() > 0) {
        durationText = duration.humanize(true);
    } else if(duration.seconds() == 1) {
        durationText = "in 1 second";
    } else {
        durationText = `in ${duration.seconds()} seconds`;
    }
    result.append(document.createTextNode(durationText));
    return result;
}

function appendJobResult(job) {
    const endlineElement = document.createElement("br");
    const resultSpan = document.createElement("span");
    resultSpan.append(createPlatformSpan(job.creatorPlatform, 'creator', null, job.creator));

    const titleSpan = document.createElement("span");
    titleSpan.append(document.createTextNode(job.title));
    titleSpan.classList.add('title');
    resultSpan.append(titleSpan);
    resultSpan.append(createPlatformSpan(job.executorPlatform, 'executor', 'processed by', job.executor));
    messages.prepend(endlineElement);
    messages.prepend(getDurationSpan(job));
    messages.prepend(resultSpan);

    const timeSpan = document.createElement("span");
    timeSpan.classList.add('time');
    timeSpan.append(document.createTextNode(moment(job.createDate).format("HH:mm:ss")));
    messages.prepend(timeSpan);
}

ws.onopen = () => appendMessage("websocket opened");
ws.onclose = () => appendMessage("websocket closed");
ws.onmessage = message => {
    const messageObject = JSON.parse(message.data);
    if (messageObject.type == "QUEUE_STATE") {
        queueSize.innerText = messageObject.messages;
        queueConsumerCount.innerText = messageObject.consumers;
        queueState.innerText = messageObject.state;
        queueError.innerText = messageObject.error || '-';
    } else {
        appendJobResult(messageObject);
        //appendMessage("websocket: " + message.data);
    }
}
