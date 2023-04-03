const formTextState_Default = 'Select your pics...'
const uploadBtnState_Default = 'Upload'
const uploadBtnState_Loading = 'Uploading...'

console.log('MAIN JS !!!')

const renderForm = () => {
    const form = `<form action="/upload" method="post" enctype="multipart/form-data">
        <label for="upload-photo" id='input-file-label'><div class='select-files-bth'>${formTextState_Default}</div></label>
        <input type="file" name="files" id="upload-photo" multiple required />
    </form>`
    $('#form-place').html(form)
    $('#upload-photo').on('change', onFileInputChange)
}

const renderUploadBtn = (state) => {
    if(state === 'default') {
        $('#upload-btn-place').html(uploadBtnState_Default)
    } else if(state === 'loading') {
        $('#upload-btn-place').html(uploadBtnState_Loading)
    }
}

const renderResponse = (res) => {
    console.log('--------------sss-',res);
    let text = ''

    res.forEach(el => {
        const { id, ext, width, height, size } = el
        const sizeMB = Number.parseFloat(size / 1000 / 1000).toFixed(1);
        text += `<div class="one-res-file">
            <div class="img">
                <img src="/i/${id}"/>
            </div>
            <div class="info">
                <div class="one-info">ID: ${id}</div>
                <div class="one-info">EXT: ${ext}</div>
                <div class="one-info">W: ${width}</div>
                <div class="one-info">H: ${height}</div>
                <div class="one-info">SIZE: ${sizeMB} MB</div>
            </div>
        </div>`
    })
    $('#response-place').html(text)
}

const renderError = (text) => {
    $('#error-place').html(text)
    setTimeout(() => {
        $('#error-place').html('')
    }, 2000)
}

const initRender = () => {
    renderForm()
    renderUploadBtn('default')
}

const getFiles = () => {
    const { files } = $('#upload-photo')[0]
    const res = []

    for(let i = 0; i < files.length; i++) {
        res.push(files[i])
    }
    return res
}

const onFileInputChange = (e) => {
    const files = getFiles()
    let res = ''
    files.forEach(file => {
        const { name, size, type } = file
        console.log(name, size, type)

        const sizeMB = Number.parseFloat(size / 1000 / 1000).toFixed(1);

        res += `${type.split('/')[1]} | ${sizeMB}MB | ${name}<br>`
    })

    if(res) {
        $('#input-file-label').html(res)
    } else {
        renderForm()
    }
}


const onUploadBtnClick = () => {
    
    const files = getFiles()

    if(files.length > 0) {

        renderUploadBtn('loading')

        const formData = new FormData();

        files.forEach(file => {
            formData.append( 
                "files[]", 
                file  
            );             
        });

        fetch('upload', {
            method: 'POST',
            body: formData,
        }).then(async (response) => {
            renderForm()
            renderUploadBtn('default')
            if(response.ok){
                const data = await response.json()
                renderResponse(data)
            }
        }).catch((error) => {
            renderForm()
            renderUploadBtn('default')
            console.log(error);
            renderError(error.message)
        })


        // axios.post('/upload', formData, {
        //     headers: {
        //         "Content-type": "multipart/form-data",
        //     }
        // })
        // .then(function (response) {
        //     renderForm()
        //     renderUploadBtn('default')
        //     renderResponse(response.data)
        // })
        // .catch(function (error) {
        //     renderForm()
        //     renderUploadBtn('default')
        //     console.log(error);
        //     renderError(error.message)
        // });

    }
}

const renderPreview = async () => {
    const res = await axios.get('/info/all')
    const { files, original } = res.data;

    const page = parseFloat(getUrlParameter('page'))

    const all = Object.values(original);

    const countImagesOnPage = 50
    const start = (page - 1) * countImagesOnPage;
    const end = start + countImagesOnPage;
    const filteres = all.slice(start, end)

    filteres.forEach(el => {
        console.log(el)
        const img = `<div class="one-img"><img src="/i/${el.id}?f=jpeg&q=70&w=200&h=200" /></div>`
        $('.list-image').append(img)
    })

    $('.right-side').prepend(`Total ${all.length/countImagesOnPage} pages`)

}

const onPassInputChange = async (e) => {
    const pass = e.target.value;
    if (pass.length >= 6) {
        try {
            const res = await axios.get(`/auth/${pass}`)
            const { data } = res;
            const { token } = data;
            window.location.href = `/auth/${pass}`
        } catch(e) {

        }
    }
}


const getUrlParameter = (sParam) => {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};