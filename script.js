let lastSearchedCity = "";
let allStations = [];
let filteredStations = [];
let currentFilter = "all";

// Fungsi untuk mendapatkan lokasi pengguna
function getUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async function (position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            try {
                let locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                let locationData = await locationResponse.json();

                let city = locationData.address.city || locationData.address.county || locationData.address.state || "Indonesia";
                document.getElementById("locationInfo").innerText = `Radio untuk wilayah: ${city}`;
                lastSearchedCity = city;

                await loadAllRadios(); // Ambil semua radio hanya sekali
                filterRadios(city);
            } catch (error) {
                console.error("Gagal mendeteksi lokasi:", error);
                document.getElementById("locationInfo").innerText = "Gagal mendeteksi lokasi, masukkan wilayah secara manual.";
            }
        }, function (error) {
            console.error("Error Geolocation:", error.message);
            document.getElementById("locationInfo").innerText = "Tidak dapat mengakses lokasi, masukkan wilayah secara manual.";
        });
    } else {
        document.getElementById("locationInfo").innerText = "Geolocation tidak didukung di browser ini.";
    }
}

// Fungsi untuk mengambil daftar semua radio di Indonesia
async function loadAllRadios() {
    try {
        let response = await fetch("https://de1.api.radio-browser.info/json/stations/bycountry/Indonesia");
        allStations = await response.json(); 
        console.log("Daftar radio berhasil diambil:", allStations);
    } catch (error) {
        console.error("Gagal mengambil daftar radio:", error);
    }
}

// Fungsi untuk memfilter radio berdasarkan kota dan jenis (FM/AM)
function filterRadios(city) {
    let select = document.getElementById("radioList");
    select.innerHTML = ""; // Hapus daftar lama

    // Filter berdasarkan kota dan jenis radio
    filteredStations = allStations.filter(station => {
        let stationState = station.state ? station.state.toLowerCase() : "";
        let stationName = station.name ? station.name.toLowerCase() : "";
        let stationFrequency = station.frequency ? parseFloat(station.frequency) : null;

        let matchCity = stationState.includes(city.toLowerCase()) || stationName.includes(city.toLowerCase());

        if (currentFilter === "fm") {
            return matchCity && (stationName.includes("fm") || (stationFrequency && stationFrequency >= 87.5 && stationFrequency <= 108.0));
        } else if (currentFilter === "am") {
            return matchCity && (stationName.includes("am") || (stationFrequency && stationFrequency < 1700));
        }
        return matchCity; // Jika filter "Semua"
    });

    if (filteredStations.length === 0) {
        select.innerHTML = "<option>Tidak ada radio di wilayah ini</option>";
        document.getElementById("audioPlayer").src = "";
        console.warn("Tidak ada radio untuk wilayah:", city);
        return;
    }

    // Tambahkan stasiun radio ke dropdown
    filteredStations.forEach(station => {
        let option = document.createElement("option");
        option.value = station.url_resolved;
        option.textContent = station.name + (station.frequency ? ` (${station.frequency} MHz)` : "");
        select.appendChild(option);
    });

    // Auto-play radio pertama jika ada
    if (filteredStations.length > 0) {
        document.getElementById("audioPlayer").src = filteredStations[0].url_resolved;
        document.getElementById("audioPlayer").play();
    }

    // Event listener untuk mengganti stasiun radio
    select.onchange = function () {
        document.getElementById("audioPlayer").src = this.value;
        document.getElementById("audioPlayer").play();
    };
}

// Fungsi untuk mencari radio berdasarkan kota atau provinsi
async function searchByLocation() {
    let locationInput = document.getElementById("searchLocation").value.trim();
    if (locationInput === "") {
        alert("Masukkan nama kota atau provinsi!");
        return;
    }

    document.getElementById("locationInfo").innerText = `Radio untuk wilayah: ${locationInput}`;
    lastSearchedCity = locationInput;

    if (allStations.length === 0) {
        await loadAllRadios();
    }

    filterRadios(locationInput);
}

// Fungsi untuk memilih radio berdasarkan jenis (FM/AM)
function filterByType(type) {
    currentFilter = type;
    filterRadios(lastSearchedCity);
}

// Jalankan pencarian lokasi saat website dibuka
getUserLocation();


    // Registrasi service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker registered'));
    }