export const REGION_MAPPING: Record<string, string[]> = {
    // Bangkok Districts (BKK1)
    "BKK1": ["ดอนเมือง", "สายไหม", "หลักสี่", "บางเขน", "คลองสามวา", "บางซื่อ", "จตุจักร", "ลาดพร้าว", "บึงกุ่ม", "คันนายาว", "วังทองหลาง", "บางกะปิ", "พญาไท", "ราชเทวี", "ดินแดง", "ห้วยขวาง",
        "Don Mueang", "Sai Mai", "Lak Si", "Bang Khen", "Khlong Sam Wa", "Bang Sue", "Chatuchak", "Lat Phrao", "Bueng Kum", "Khan Na Yao", "Wang Thonglang", "Bang Kapi", "Phaya Thai", "Ratchathewi", "Din Daeng", "Huai Khwang"],
    // Bangkok Districts (BKK2)
    "BKK2": ["ทวีวัฒนา", "ตลิ่งชัน", "บางพลัด", "บางกอกน้อย", "บางกอกใหญ่", "ภาษีเจริญ", "ธนบุรี", "คลองสาน", "พระนคร", "ป้อมปราบศัตรูพ่าย", "สัมพันธวงศ์", "หนองแขม", "บางแค", "จอมทอง", "ราษฎร์บูรณะ", "ทุ่งครุ", "บางขุนเทียน", "บางบอน",
        "Thawi Watthana", "Taling Chan", "Bang Phlat", "Bangkok Noi", "Bangkok Yai", "Phasi Charoen", "Thon Buri", "Khlong San", "Phra Nakhon", "Pom Prap Sattru Phai", "Samphanthawong", "Nong Khaem", "Bang Khae", "Chom Thong", "Rat Burana", "Thung Khru", "Bang Khun Thian", "Bang Bon"],
    // Bangkok Districts (BKK3) - Note: Also includes Samut Prakan Province
    "BKK3": ["หนองจอก", "มีนบุรี", "ลาดกระบัง", "สะพานสูง", "สวนหลวง", "วัฒนา", "คลองเตย", "พระโขนง", "บางนา", "ประเวศ",
        "Nong Chok", "Min Buri", "Lat Krabang", "Saphan Sung", "Suan Luang", "Watthana", "Khlong Toei", "Phra Khanong", "Bang Na", "Prawet"],
    // Bangkok Districts (BKK4)
    "BKK4": ["ปทุมวัน", "บางรัก", "สาทร", "บางคอแหลม", "ยานนาวา",
        "Pathum Wan", "Bang Rak", "Sathon", "Bang Kho Laem", "Yan Nawa"],

    // Northern Provinces (NOR)
    "NOR": ["เชียงราย", "แม่ฮ่องสอน", "เชียงใหม่", "พะเยา", "น่าน", "ลำพูน", "ลำปาง", "แพร่", "อุตรดิตถ์", "สุโขทัย", "ตาก", "พิษณุโลก",
        "Chiang Rai", "Mae Hong Son", "Chiang Mai", "Phayao", "Nan", "Lamphun", "Lampang", "Phrae", "Uttaradit", "Sukhothai", "Tak", "Phitsanulok"],

    // Northeast (ESA1)
    "ESA1": ["เลย", "หนองคาย", "บึงกาฬ", "อุดรธานี", "สกลนคร", "นครพนม", "หนองบัวลำภู", "ขอนแก่น", "กาฬสินธุ์", "มุกดาหาร", "ชัยภูมิ",
        "Loei", "Nong Khai", "Bueng Kan", "Udon Thani", "Sakon Nakhon", "Nakhon Phanom", "Nong Bua Lamphu", "Khon Kaen", "Kalasin", "Mukdahan", "Chaiyaphum"],

    // Northeast (ESA2)
    "ESA2": ["นครราชสีมา", "มหาสารคาม", "ร้อยเอ็ด", "ยโสธร", "อำนาจเจริญ", "อุบลราชธานี", "บุรีรัมย์", "สุรินทร์", "ศรีสะเกษ",
        "Nakhon Ratchasima", "Maha Sarakham", "Roi Et", "Yasothon", "Amnat Charoen", "Ubon Ratchathani", "Buri Ram", "Surin", "Si Sa Ket"],

    // Central & West (CEN)
    "CEN": ["กำแพงเพชร", "พิจิตร", "เพชรบูรณ์", "นครสวรรค์", "อุทัยธานี", "ชัยนาท", "สิงห์บุรี", "ลพบุรี", "อ่างทอง", "สระบุรี", "นครนายก", "พระนครศรีอยุธยา", "สุพรรณบุรี", "กาญจนบุรี", "ปทุมธานี", "นนทบุรี", "นครปฐม", "สมุทรสาคร", "สมุทรสงคราม", "ราชบุรี", "เพชรบุรี", "ประจวบคีรีขันธ์",
        "Kamphaeng Phet", "Phichit", "Phetchabun", "Nakhon Sawan", "Uthai Thani", "Chai Nat", "Sing Buri", "Lop Buri", "Ang Thong", "Saraburi", "Nakhon Nayok", "Phra Nakhon Si Ayutthaya", "Suphan Buri", "Kanchanaburi", "Pathum Thani", "Nonthaburi", "Nakhon Pathom", "Samut Sakhon", "Samut Songkhram", "Ratchaburi", "Phetchaburi", "Prachuap Khiri Khan"],

    // East (EST)
    "EST": ["ปราจีนบุรี", "สระแก้ว", "ฉะเชิงเทรา", "ชลบุรี", "ระยอง", "จันทบุรี", "ตราด",
        "Prachin Buri", "Sa Kaeo", "Chachoengsao", "Chon Buri", "Rayong", "Chanthaburi", "Trat"],

    // South (SOU)
    "SOU": ["ชุมพร", "ระนอง", "สุราษฎร์ธานี", "พังงา", "นครศรีธรรมราช", "กระบี่", "ภูเก็ต", "ตรัง", "พัทลุง", "สตูล", "สงขลา", "ปัตตานี", "ยะลา", "นราธิวาส",
        "Chumphon", "Ranong", "Surat Thani", "Phangnga", "Nakhon Si Thammarat", "Krabi", "Phuket", "Trang", "Phatthalung", "Satun", "Songkhla", "Pattani", "Yala", "Narathiwat"]
};

export const getRegion = (province: string, district?: string): string => {
    if (!province) return "";

    // Normalize inputs
    const p = province.trim();
    const d = district ? district.trim() : "";

    // 1. Check for Special Province Cases
    if (p === "สมุทรปราการ" || p === "Samut Prakan") return "BKK3";

    // 2. Bangkok Case - Check District
    if (p.includes("กรุงเทพ") || p.includes("Bangkok")) {
        if (!d) return "BKK"; // Fallback if no district
        if (REGION_MAPPING["BKK1"].some(x => d.includes(x))) return "BKK1";
        if (REGION_MAPPING["BKK2"].some(x => d.includes(x))) return "BKK2";
        if (REGION_MAPPING["BKK3"].some(x => d.includes(x))) return "BKK3";
        if (REGION_MAPPING["BKK4"].some(x => d.includes(x))) return "BKK4";
        return "BKK"; // Unknown district
    }

    // 3. Other Provinces
    if (REGION_MAPPING["NOR"].includes(p)) return "NOR";
    if (REGION_MAPPING["ESA1"].includes(p)) return "ESA1";
    if (REGION_MAPPING["ESA2"].includes(p)) return "ESA2";
    if (REGION_MAPPING["CEN"].includes(p)) return "CEN";
    if (REGION_MAPPING["EST"].includes(p)) return "EST";
    if (REGION_MAPPING["SOU"].includes(p)) return "SOU";

    return "Other";
};
