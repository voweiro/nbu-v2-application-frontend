// Data structure for global location data
// This file aggregates country, state/province, and LGA (where applicable) information.

interface LocationData {
  states: {
    name: string;
    lgas?: string[]; // Local Government Areas or Counties or Districts
  }[];
}

export const WORLD_LOCATIONS: Record<string, LocationData> = {
  "Nigeria": {
    states: [
      {
        name: "Abia",
        lgas: [
          "Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North",
          "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Ugwunagbo",
          "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"
        ]
      },
      {
        name: "Adamawa",
        lgas: [
          "Demsa", "Fufure", "Ganye", "Gayuk", "Gombi", "Grie", "Hong", "Jada", "Lamurde",
          "Madagali", "Maiha", "Mayo Belwa", "Michika", "Mubi North", "Mubi South", "Numan",
          "Shelleng", "Song", "Toungo", "Yola North", "Yola South"
        ]
      },
      {
        name: "Akwa Ibom",
        lgas: [
          "Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan",
          "Ibeno", "Ibesikpo Asutan", "Ibiono-Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene",
          "Ini", "Itu", "Mbo", "Mkpat-Enin", "Nsit-Atai", "Nsit-Ibom", "Nsit-Ubium", "Obot Akara",
          "Okobo", "Onna", "Oron", "Oruk Anam", "Udung-Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko",
          "Uyo"
        ]
      },
      {
        name: "Anambra",
        lgas: [
          "Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South",
          "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala",
          "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South",
          "Orumba North", "Orumba South", "Oyi"
        ]
      },
      {
        name: "Bauchi",
        lgas: [
          "Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa",
          "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira",
          "Tafawa Balewa", "Toro", "Warji", "Zaki"
        ]
      },
      {
        name: "Bayelsa",
        lgas: [
          "Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw",
          "Yenagoa"
        ]
      },
      {
        name: "Benue",
        lgas: [
          "Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West",
          "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo",
          "Ohimini", "Oju", "Okpokwu", "Otukpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"
        ]
      },
      {
        name: "Borno",
        lgas: [
          "Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa",
          "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga",
          "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar",
          "Monguno", "Ngala", "Nganzai", "Shani"
        ]
      },
      {
        name: "Cross River",
        lgas: [
          "Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal",
          "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja",
          "Yakuur", "Yala"
        ]
      },
      {
        name: "Delta",
        lgas: [
          "Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West",
          "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West",
          "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North",
          "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"
        ]
      },
      {
        name: "Ebonyi",
        lgas: [
          "Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South",
          "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"
        ]
      },
      {
        name: "Edo",
        lgas: [
          "Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West",
          "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba Okha", "Oredo",
          "Orhionmwon", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"
        ]
      },
      {
        name: "Ekiti",
        lgas: [
          "Ado Ekiti", "Efon", "Ekiti East", "Ekiti South-West", "Ekiti West", "Emure",
          "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun",
          "Ise/Orun", "Moba", "Oye"
        ]
      },
      {
        name: "Enugu",
        lgas: [
          "Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu",
          "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East",
          "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo Uwani"
        ]
      },
      {
        name: "FCT",
        lgas: [
          "Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"
        ]
      },
      {
        name: "Gombe",
        lgas: [
          "Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo",
          "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"
        ]
      },
      {
        name: "Imo",
        lgas: [
          "Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North",
          "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli",
          "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema",
          "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North",
          "Owerri West", "Unuimo"
        ]
      },
      {
        name: "Jigawa",
        lgas: [
          "Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa",
          "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa",
          "Kaugama", "Kazaure", "Kiri Kasama", "Kiyawa", "Maigatari", "Malam Madori",
          "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"
        ]
      },
      {
        name: "Kaduna",
        lgas: [
          "Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a",
          "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura",
          "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga",
          "Soba", "Zangon Kataf", "Zaria"
        ]
      },
      {
        name: "Kano",
        lgas: [
          "Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta",
          "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam",
          "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya",
          "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa",
          "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa",
          "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"
        ]
      },
      {
        name: "Katsina",
        lgas: [
          "Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume",
          "Danja", "Dan Musa", "Daura", "Dutsi", "Dutsin Ma", "Faskari", "Funtua", "Ingawa",
          "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada",
          "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa",
          "Safana", "Sandamu", "Zango"
        ]
      },
      {
        name: "Kebbi",
        lgas: [
          "Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza",
          "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski",
          "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"
        ]
      },
      {
        name: "Kogi",
        lgas: [
          "Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu",
          "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa Muro", "Ofu", "Ogori/Magongo",
          "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"
        ]
      },
      {
        name: "Kwara",
        lgas: [
          "Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South",
          "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero",
          "Oyun", "Pategi"
        ]
      },
      {
        name: "Lagos",
        lgas: [
          "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry",
          "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe",
          "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu",
          "Surulere"
        ]
      },
      {
        name: "Nasarawa",
        lgas: [
          "Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia",
          "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"
        ]
      },
      {
        name: "Niger",
        lgas: [
          "Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako",
          "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga",
          "Mashegu", "Mokwa", "Moya", "Paikoro", "Rafi", "Rijau", "Shiroro",
          "Suleja", "Tafa", "Wushishi"
        ]
      },
      {
        name: "Ogun",
        lgas: [
          "Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South",
          "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode",
          "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside",
          "Remo North", "Shagamu"
        ]
      },
      {
        name: "Ondo",
        lgas: [
          "Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West",
          "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo",
          "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"
        ]
      },
      {
        name: "Osun",
        lgas: [
          "Atakunmosa East", "Atakunmosa West", "Ayedaade", "Ayedire", "Boluwaduro",
          "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ife Central",
          "Ife East", "Ife North", "Ife South", "Ifedayo", "Ifelodun", "Ila", "Ilesa East",
          "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin",
          "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"
        ]
      },
      {
        name: "Oyo",
        lgas: [
          "Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East",
          "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central",
          "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa",
          "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo",
          "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo East", "Oyo West", "Saki East",
          "Saki West", "Surulere"
        ]
      },
      {
        name: "Plateau",
        lgas: [
          "Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South", "Kanam",
          "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin",
          "Qua'an Pan", "Riyom", "Shendam", "Wase"
        ]
      },
      {
        name: "Rivers",
        lgas: [
          "Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru",
          "Bonny", "Degema", "Eleme", "Emohua", "Etche", "Gokana", "Ikwerre", "Khana",
          "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro",
          "Oyigbo", "Port Harcourt", "Tai"
        ]
      },
      {
        name: "Sokoto",
        lgas: [
          "Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa",
          "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari",
          "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta",
          "Wamakko", "Wurno", "Yabo"
        ]
      },
      {
        name: "Taraba",
        lgas: [
          "Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo",
          "Karim Lamido", "Kurmi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari",
          "Yorro", "Zing"
        ]
      },
      {
        name: "Yobe",
        lgas: [
          "Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani",
          "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa",
          "Yunusari", "Yusufari"
        ]
      },
      {
        name: "Zamfara",
        lgas: [
          "Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Chafe",
          "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi",
          "Talata Mafara", "Zurmi"
        ]
      }
    ]
  },
  "Ghana": {
    states: [
      { name: "Ahafo" },
      { name: "Ashanti" },
      { name: "Bono" },
      { name: "Bono East" },
      { name: "Central" },
      { name: "Eastern" },
      { name: "Greater Accra" },
      { name: "North East" },
      { name: "Northern" },
      { name: "Oti" },
      { name: "Savannah" },
      { name: "Upper East" },
      { name: "Upper West" },
      { name: "Volta" },
      { name: "Western" },
      { name: "Western North" }
    ]
  },
  "United States of America": {
    states: [
      { name: "Alabama" }, { name: "Alaska" }, { name: "Arizona" }, { name: "Arkansas" }, { name: "California" },
      { name: "Colorado" }, { name: "Connecticut" }, { name: "Delaware" }, { name: "Florida" }, { name: "Georgia" },
      { name: "Hawaii" }, { name: "Idaho" }, { name: "Illinois" }, { name: "Indiana" }, { name: "Iowa" },
      { name: "Kansas" }, { name: "Kentucky" }, { name: "Louisiana" }, { name: "Maine" }, { name: "Maryland" },
      { name: "Massachusetts" }, { name: "Michigan" }, { name: "Minnesota" }, { name: "Mississippi" }, { name: "Missouri" },
      { name: "Montana" }, { name: "Nebraska" }, { name: "Nevada" }, { name: "New Hampshire" }, { name: "New Jersey" },
      { name: "New Mexico" }, { name: "New York" }, { name: "North Carolina" }, { name: "North Dakota" }, { name: "Ohio" },
      { name: "Oklahoma" }, { name: "Oregon" }, { name: "Pennsylvania" }, { name: "Rhode Island" }, { name: "South Carolina" },
      { name: "South Dakota" }, { name: "Tennessee" }, { name: "Texas" }, { name: "Utah" }, { name: "Vermont" },
      { name: "Virginia" }, { name: "Washington" }, { name: "West Virginia" }, { name: "Wisconsin" }, { name: "Wyoming" },
      { name: "District of Columbia" }
    ]
  },
  "Canada": {
    states: [
      { name: "Alberta" },
      { name: "British Columbia" },
      { name: "Manitoba" },
      { name: "New Brunswick" },
      { name: "Newfoundland and Labrador" },
      { name: "Northwest Territories" },
      { name: "Nova Scotia" },
      { name: "Nunavut" },
      { name: "Ontario" },
      { name: "Prince Edward Island" },
      { name: "Quebec" },
      { name: "Saskatchewan" },
      { name: "Yukon" }
    ]
  },
  "United Kingdom": {
    states: [
      { name: "England" },
      { name: "Scotland" },
      { name: "Wales" },
      { name: "Northern Ireland" }
    ]
  },
  "South Africa": {
    states: [
      { name: "Eastern Cape" },
      { name: "Free State" },
      { name: "Gauteng" },
      { name: "KwaZulu-Natal" },
      { name: "Limpopo" },
      { name: "Mpumalanga" },
      { name: "North West" },
      { name: "Northern Cape" },
      { name: "Western Cape" }
    ]
  },
  "Kenya": {
    states: [
        { name: "Mombasa" }, { name: "Kwale" }, { name: "Kilifi" }, { name: "Tana River" }, { name: "Lamu" },
        { name: "Taita-Taveta" }, { name: "Garissa" }, { name: "Wajir" }, { name: "Mandera" }, { name: "Marsabit" },
        { name: "Isiolo" }, { name: "Meru" }, { name: "Tharaka-Nithi" }, { name: "Embu" }, { name: "Kitui" },
        { name: "Machakos" }, { name: "Makueni" }, { name: "Nyandarua" }, { name: "Nyeri" }, { name: "Kirinyaga" },
        { name: "Murang'a" }, { name: "Kiambu" }, { name: "Turkana" }, { name: "West Pokot" }, { name: "Samburu" },
        { name: "Trans-Nzoia" }, { name: "Uasin Gishu" }, { name: "Elgeyo-Marakwet" }, { name: "Nandi" }, { name: "Baringo" },
        { name: "Laikipia" }, { name: "Nakuru" }, { name: "Narok" }, { name: "Kajiado" }, { name: "Kericho" },
        { name: "Bomet" }, { name: "Kakamega" }, { name: "Vihiga" }, { name: "Bungoma" }, { name: "Busia" },
        { name: "Siaya" }, { name: "Kisumu" }, { name: "Homa Bay" }, { name: "Migori" }, { name: "Kisii" },
        { name: "Nyamira" }, { name: "Nairobi" }
    ]
  },
  "Australia": {
    states: [
        { name: "New South Wales" }, { name: "Victoria" }, { name: "Queensland" }, { name: "Western Australia" },
        { name: "South Australia" }, { name: "Tasmania" }, { name: "Australian Capital Territory" }, { name: "Northern Territory" }
    ]
  },
  "Germany": {
    states: [
        { name: "Baden-Württemberg" }, { name: "Bavaria" }, { name: "Berlin" }, { name: "Brandenburg" }, { name: "Bremen" },
        { name: "Hamburg" }, { name: "Hesse" }, { name: "Lower Saxony" }, { name: "Mecklenburg-Vorpommern" }, { name: "North Rhine-Westphalia" },
        { name: "Rhineland-Palatinate" }, { name: "Saarland" }, { name: "Saxony" }, { name: "Saxony-Anhalt" }, { name: "Schleswig-Holstein" },
        { name: "Thuringia" }
    ]
  },
  "India": {
    states: [
        { name: "Andhra Pradesh" }, { name: "Arunachal Pradesh" }, { name: "Assam" }, { name: "Bihar" }, { name: "Chhattisgarh" },
        { name: "Goa" }, { name: "Gujarat" }, { name: "Haryana" }, { name: "Himachal Pradesh" }, { name: "Jharkhand" },
        { name: "Karnataka" }, { name: "Kerala" }, { name: "Madhya Pradesh" }, { name: "Maharashtra" }, { name: "Manipur" },
        { name: "Meghalaya" }, { name: "Mizoram" }, { name: "Nagaland" }, { name: "Odisha" }, { name: "Punjab" },
        { name: "Rajasthan" }, { name: "Sikkim" }, { name: "Tamil Nadu" }, { name: "Telangana" }, { name: "Tripura" },
        { name: "Uttar Pradesh" }, { name: "Uttarakhand" }, { name: "West Bengal" },
        { name: "Andaman and Nicobar Islands" }, { name: "Chandigarh" }, { name: "Dadra and Nagar Haveli and Daman and Diu" },
        { name: "Delhi" }, { name: "Jammu and Kashmir" }, { name: "Ladakh" }, { name: "Lakshadweep" }, { name: "Puducherry" }
    ]
  },
  "China": {
    states: [
        { name: "Anhui" }, { name: "Fujian" }, { name: "Gansu" }, { name: "Guangdong" }, { name: "Guizhou" },
        { name: "Hainan" }, { name: "Hebei" }, { name: "Heilongjiang" }, { name: "Henan" }, { name: "Hubei" },
        { name: "Hunan" }, { name: "Jiangsu" }, { name: "Jiangxi" }, { name: "Jilin" }, { name: "Liaoning" },
        { name: "Qinghai" }, { name: "Shaanxi" }, { name: "Shandong" }, { name: "Shanxi" }, { name: "Sichuan" },
        { name: "Yunnan" }, { name: "Zhejiang" },
        { name: "Guangxi" }, { name: "Inner Mongolia" }, { name: "Ningxia" }, { name: "Tibet" }, { name: "Xinjiang" },
        { name: "Beijing" }, { name: "Chongqing" }, { name: "Shanghai" }, { name: "Tianjin" },
        { name: "Hong Kong" }, { name: "Macau" }
    ]
  },
  "Brazil": {
    states: [
        { name: "Acre" }, { name: "Alagoas" }, { name: "Amapá" }, { name: "Amazonas" }, { name: "Bahia" },
        { name: "Ceará" }, { name: "Espírito Santo" }, { name: "Goiás" }, { name: "Maranhão" }, { name: "Mato Grosso" },
        { name: "Mato Grosso do Sul" }, { name: "Minas Gerais" }, { name: "Pará" }, { name: "Paraíba" }, { name: "Paraná" },
        { name: "Pernambuco" }, { name: "Piauí" }, { name: "Rio de Janeiro" }, { name: "Rio Grande do Norte" }, { name: "Rio Grande do Sul" },
        { name: "Rondônia" }, { name: "Roraima" }, { name: "Santa Catarina" }, { name: "São Paulo" }, { name: "Sergipe" },
        { name: "Tocantins" }, { name: "Distrito Federal" }
    ]
  },
  // Default entry for other countries to prevent errors
  "Others": {
    states: []
  }
};
