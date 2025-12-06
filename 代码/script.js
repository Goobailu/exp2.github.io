const albumArt = document.getElementById('albumArt');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressContainer = document.getElementById('progressContainer');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const playlistToggle = document.getElementById('playlistToggle');
const playlist = document.getElementById('playlist');
const closePlaylist = document.getElementById('closePlaylist');
const playlistItems = document.querySelectorAll('.playlist-item');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const nowPlayingSong = document.getElementById('nowPlayingSong');
const volumeSlider = document.getElementById('volumeSlider');
const volumeProgress = document.getElementById('volumeProgress');
const audio = document.getElementById('audio');
const methodBtn = document.getElementById('method');
const speedBtn = document.getElementById('speed');

// 初始设置
audio.volume = 0.7;

// audio 事件驱动 UI
audio.addEventListener('play', () => {
    albumArt.classList.add('playing');
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
});

audio.addEventListener('pause', () => {
    albumArt.classList.remove('playing');
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
});

audio.addEventListener('ended', () => {
    // handled by playback mode
    handleTrackEnd();
});

// 播放模式：顺序 / 单曲 / 随机
const playbackModes = ['sequence', 'single', 'shuffle'];
let playbackModeIndex = 0; // 默认顺序
function updateMethodUI() {
    if (!methodBtn) return;
    const mode = playbackModes[playbackModeIndex];
    if (mode === 'sequence') {
        methodBtn.textContent = '顺序';
        methodBtn.title = '顺序循环';
        audio.loop = false;
    } else if (mode === 'single') {
        methodBtn.textContent = '单曲';
        methodBtn.title = '单曲循环';
        audio.loop = true;
    } else if (mode === 'shuffle') {
        methodBtn.textContent = '随机';
        methodBtn.title = '随机播放';
        audio.loop = false;
    }
}
if (methodBtn) {
    updateMethodUI();
    methodBtn.addEventListener('click', () => {
        playbackModeIndex = (playbackModeIndex + 1) % playbackModes.length;
        updateMethodUI();
    });
}

function handleTrackEnd() {
    const mode = playbackModes[playbackModeIndex];
    if (mode === 'single') {
        // audio.loop already true, but ensure restart
        audio.currentTime = 0;
        audio.play();
    } else if (mode === 'sequence') {
        // play next in sequence
        playNextSequential();
    } else if (mode === 'shuffle') {
        playRandomTrack();
    }
}

function playRandomTrack() {
    if (!playlistItems || playlistItems.length === 0) return;
    if (playlistItems.length === 1) {
        loadSong(0);
        audio.play();
        return;
    }
    let rand = currentSongIndex;
    while (rand === currentSongIndex) {
        rand = Math.floor(Math.random() * playlistItems.length);
    }
    loadSong(rand);
    audio.play();
}

function playNextSequential() {
    currentSongIndex++;
    if (currentSongIndex > playlistItems.length - 1) currentSongIndex = 0;
    loadSong(currentSongIndex);
    audio.play();
}

function playPrevSequential() {
    currentSongIndex--;
    if (currentSongIndex < 0) currentSongIndex = playlistItems.length - 1;
    loadSong(currentSongIndex);
    audio.play();
}

// 格式化时间 (秒 -> 分:秒)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60) || 0;
    const secs = Math.floor(seconds % 60) || 0;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 更新进度条
function updateProgress() {
    if (!audio.duration || isNaN(audio.duration)) return;
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
}

// 设置进度条（点击）
function setProgress(e) {
    const rect = this.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (audio.duration) {
        audio.currentTime = (clickX / width) * audio.duration;
    }
}

// 更新音量 UI
function updateVolumeUI() {
    volumeProgress.style.width = `${audio.volume * 100}%`;
    const volumeIcon = document.querySelector('.volume-icon i');
    if (audio.volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (audio.volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// 设置音量（点击）
function setVolume(e) {
    const rect = this.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const vol = Math.max(0, Math.min(1, clickX / rect.width));
    audio.volume = vol;
    updateVolumeUI();
}

// 播放/暂停
playPauseBtn.addEventListener('click', () => {
    if (audio.paused) audio.play(); else audio.pause();
});

// 上一曲/下一曲
let currentSongIndex = 0;

function loadSong(index) {
    const song = playlistItems[index];
    if (!song) return;
    const title = song.querySelector('.playlist-item-title').textContent;
    const artist = song.querySelector('.playlist-item-artist').textContent;
    const imgSrc = song.querySelector('img').src;
    const src = song.dataset.src;

    songTitle.textContent = title;
    songArtist.textContent = artist;
    albumArt.querySelector('img').src = imgSrc;
    nowPlayingSong.textContent = `${title} - ${artist}`;

    // 更新活跃状态
    playlistItems.forEach(item => item.classList.remove('active'));
    song.classList.add('active');

    currentSongIndex = index;

    if (src) {
        audio.src = src;
        audio.load();
    }
    audio.currentTime = 0;
}

prevBtn.addEventListener('click', () => {
    const mode = playbackModes[playbackModeIndex];
    if (mode === 'shuffle') {
        playRandomTrack();
    } else {
        playPrevSequential();
    }
});

nextBtn.addEventListener('click', () => {
    const mode = playbackModes[playbackModeIndex];
    if (mode === 'shuffle') {
        playRandomTrack();
    } else {
        playNextSequential();
    }
});

// 播放列表显示/关闭
playlistToggle.addEventListener('click', () => playlist.classList.add('active'));
closePlaylist.addEventListener('click', () => playlist.classList.remove('active'));

// 点击播放列表项切换歌曲
playlistItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        loadSong(index);
        audio.play();
        playlist.classList.remove('active');
    });
});

// 进度与音量事件
progressContainer.addEventListener('click', setProgress);
volumeSlider.addEventListener('click', setVolume);

// 进度条拖拽支持（鼠标与触摸）
let isSeeking = false;

function getPointerClientX(e) {
    if (e.touches && e.touches.length) return e.touches[0].clientX;
    return e.clientX;
}

function startSeek(e) {
    e.preventDefault();
    isSeeking = true;
    // update once immediately
    moveSeek(e);
    document.addEventListener('mousemove', moveSeek);
    document.addEventListener('mouseup', endSeek);
    document.addEventListener('touchmove', moveSeek, { passive: false });
    document.addEventListener('touchend', endSeek);
}

function moveSeek(e) {
    if (!isSeeking) return;
    const rect = progressContainer.getBoundingClientRect();
    const clientX = getPointerClientX(e);
    let pos = clientX - rect.left;
    pos = Math.max(0, Math.min(rect.width, pos));
    if (audio.duration) {
        audio.currentTime = (pos / rect.width) * audio.duration;
        updateProgress();
    }
    // prevent scrolling while touching
    if (e.cancelable) e.preventDefault();
}

function endSeek(e) {
    isSeeking = false;
    document.removeEventListener('mousemove', moveSeek);
    document.removeEventListener('mouseup', endSeek);
    document.removeEventListener('touchmove', moveSeek);
    document.removeEventListener('touchend', endSeek);
}

progressContainer.addEventListener('mousedown', startSeek);
progressContainer.addEventListener('touchstart', startSeek, { passive: false });

// audio 元数据与进度更新
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
    updateProgress();
});
audio.addEventListener('timeupdate', updateProgress);

// 初始化：加载首首歌曲并同步 UI
loadSong(0);
updateVolumeUI();
if (audio.paused) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; else playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';

// 调速弹出列表功能
const speedOptions = [0.5, 1, 1.5, 2];
let speedListEl = null;
function updateSpeedUI() {
    if (!speedBtn) return;
    speedBtn.textContent = (Math.round(audio.playbackRate * 100) / 100) + 'x';
    speedBtn.title = '播放速度：' + (Math.round(audio.playbackRate * 100) / 100) + 'x';
}

function createSpeedList() {
    if (speedListEl) return speedListEl;
    const list = document.createElement('div');
    list.className = 'speed-list';
    speedOptions.forEach(rate => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'speed-item';
        item.textContent = rate + 'x';
        item.dataset.rate = rate;
        if (Math.abs(audio.playbackRate - rate) < 0.001) item.classList.add('active');
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            audio.playbackRate = rate;
            updateSpeedUI();
            closeSpeedList();
        });
        list.appendChild(item);
    });
    list.addEventListener('click', (e) => e.stopPropagation());
    speedListEl = list;
    return list;
}

function openSpeedList() {
    if (!speedBtn) return;
    const container = document.querySelector('.now-playing-right') || document.querySelector('.now-playing') || document.body;
    const list = createSpeedList();
    // remove existing to refresh active state
    if (list.parentNode) list.parentNode.removeChild(list);
    // update active class
    Array.from(list.querySelectorAll('.speed-item')).forEach(btn => {
        btn.classList.toggle('active', Math.abs(parseFloat(btn.dataset.rate) - audio.playbackRate) < 0.001);
    });
    container.appendChild(list);
}

function closeSpeedList() {
    if (speedListEl && speedListEl.parentNode) speedListEl.parentNode.removeChild(speedListEl);
}

if (speedBtn) {
    // default rate
    if (!audio.playbackRate) audio.playbackRate = 1;
    updateSpeedUI();
    speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (speedListEl && speedListEl.parentNode) closeSpeedList(); else openSpeedList();
    });
    // 点击页面其他地方收起
    document.addEventListener('click', (e) => {
        if (!speedListEl) return;
        const target = e.target;
        if (target === speedBtn || (speedListEl && speedListEl.contains(target))) return;
        closeSpeedList();
    });
}