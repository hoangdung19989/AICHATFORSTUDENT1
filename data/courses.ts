
import type { Course, Grade, PracticeChapter, LessonLookupInfo, Lesson } from '../types/index';

export const GRADES_BY_SUBJECT: Record<string, Grade[]> = {
  'lecture-math': [
    { id: 'math-6', name: 'Toán Lớp 6', courseId: 'math-6' },
    { id: 'math-7', name: 'Toán Lớp 7', courseId: 'math-7' },
    { id: 'math-8', name: 'Toán Lớp 8', courseId: 'math-8' },
    { id: 'math-9', name: 'Toán Lớp 9', courseId: 'math-9' },
  ],
  'lecture-literature': [
    { id: 'lit-6', name: 'Ngữ văn Lớp 6', courseId: 'lit-6' },
    { id: 'lit-7', name: 'Ngữ văn Lớp 7', courseId: 'lit-7' },
    { id: 'lit-8', name: 'Ngữ văn Lớp 8', courseId: 'lit-8' },
    { id: 'lit-9', name: 'Ngữ văn Lớp 9', courseId: 'lit-9' },
  ],
  'lecture-english': [
    { id: 'eng-6', name: 'Tiếng Anh Lớp 6', courseId: 'eng-6' },
    { id: 'eng-7', name: 'Tiếng Anh Lớp 7', courseId: 'eng-7' },
    { id: 'eng-8', name: 'Tiếng Anh Lớp 8', courseId: 'eng-8' },
    { id: 'eng-9', name: 'Tiếng Anh Lớp 9', courseId: 'eng-9' },
  ],
  'lecture-science': [
    { id: 'sci-6', name: 'KHTN Lớp 6', courseId: 'sci-6' },
    { id: 'sci-7', name: 'KHTN Lớp 7', courseId: 'sci-7' },
    { id: 'sci-8', name: 'KHTN Lớp 8', courseId: 'sci-8' },
    { id: 'sci-9', name: 'KHTN Lớp 9', courseId: 'sci-9' },
  ],
  'lecture-history-geo': [
    { id: 'hg-6', name: 'LS & ĐL Lớp 6', courseId: 'hg-6' },
    { id: 'hg-7', name: 'LS & ĐL Lớp 7', courseId: 'hg-7' },
    { id: 'hg-8', name: 'LS & ĐL Lớp 8', courseId: 'hg-8' },
    { id: 'hg-9', name: 'LS & ĐL Lớp 9', courseId: 'hg-9' },
  ],
};

// Helper giữ lại cho các môn khác để code gọn, NHƯNG Toán 6 sẽ viết tường minh
const l = (id: string, title: string, url: string = ''): Lesson => ({
    id,
    title,
    type: 'video',
    videoUrl: url || `https://vcos.cloudstorage.com.vn/1-bucket-1111/Math/${id}.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256`
});

// =============================================================================
// PHẦN 1: TOÁN HỌC (Đã cập nhật cấu trúc tường minh cho Toán 6)
// =============================================================================

const MATH_6_COURSE_DATA: Course = {
  id: 'math-6',
  subjectName: 'Toán',
  gradeLevel: 6,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'm6-c1',
      title: 'CHƯƠNG I. TẬP HỢP CÁC SỐ TỰ NHIÊN.',
      lessons: [
        {
          id: 'm6-c1-l1',
          title: 'Bài 1. Tập hợp.',
          type: 'video',
          videoUrl: 'https://vcos.cloudstorage.com.vn/1-bucket-1111/T%E1%BA%ADp_h%E1%BB%A3p_c%C3%A1c_s%E1%BB%91_t%E1%BB%B1_nhi%C3%AAn.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=atm305057-s3user%2F20251205%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251205T175548Z&X-Amz-Expires=518352&X-Amz-Signature=fded2c999c06332b12254f3459c77de18beb35bee756642d65f77fe9527a2dd1&X-Amz-SignedHeaders=host'
        },
        {
          id: 'm6-c1-l2',
          title: 'Bài 2. Cách ghi số tự nhiên.',
          type: 'video',
          videoUrl: '' // Dán link video Bài 2 vào đây
        },
        {
          id: 'm6-c1-l3',
          title: 'Bài 3. Thứ tự trong tập hợp các số tự nhiên.',
          type: 'video',
          videoUrl: ''
        },
        {
          id: 'm6-c1-l4',
          title: 'Bài 4. Phép cộng và phép trừ số tự nhiên.',
          type: 'video',
          videoUrl: ''
        },
        {
          id: 'm6-c1-l5',
          title: 'Bài 5. Phép nhân và phép chia số tự nhiên.',
          type: 'video',
          videoUrl: ''
        },
        {
          id: 'm6-c1-l6',
          title: 'Bài 6. Luỹ thừa với số mũ tự nhiên.',
          type: 'video',
          videoUrl: ''
        },
        {
          id: 'm6-c1-l7',
          title: 'Bài 7. Thứ tự thực hiện các phép tính.',
          type: 'video',
          videoUrl: ''
        }
      ]
    },
    {
      id: 'm6-c2',
      title: 'CHƯƠNG II. TÍNH CHIA HẾT TRONG TẬP HỢP CÁC SỐ TỰ NHIÊN.',
      lessons: [
        {
          id: 'm6-c2-l8',
          title: 'Bài 8. Quan hệ chia hết và tính chất.',
          type: 'video',
          videoUrl: ''
        },
        {
          id: 'm6-c2-l9',
          title: 'Bài 9. Dấu hiệu chia hết.',
          type: 'video',
          videoUrl: ''
        },
        {
          id: 'm6-c2-l10',
          title: 'Bài 10. Số nguyên tố.',
          type: 'video',
          videoUrl: ''
        },
        {
          id: 'm6-c2-l11',
          title: 'Bài 11. Ước chung. Ước chung lớn nhất.',
          type: 'video',
          videoUrl: ''
        },
        {
          id: 'm6-c2-l12',
          title: 'Bài 12. Bội chung. Bội chung nhỏ nhất.',
          type: 'video',
          videoUrl: ''
        }
      ]
    },
    {
      id: 'm6-c3',
      title: 'CHƯƠNG III. SỐ NGUYÊN.',
      lessons: [
        { id: 'm6-c3-l13', title: 'Bài 13. Tập hợp các số nguyên.', type: 'video', videoUrl: '' },
        { id: 'm6-c3-l14', title: 'Bài 14. Phép cộng và phép trừ số nguyên.', type: 'video', videoUrl: '' },
        { id: 'm6-c3-l15', title: 'Bài 15. Quy tắc dấu ngoặc.', type: 'video', videoUrl: '' },
        { id: 'm6-c3-l16', title: 'Bài 16. Phép nhân số nguyên.', type: 'video', videoUrl: '' },
        { id: 'm6-c3-l17', title: 'Bài 17. Phép chia hết. Ước và bội của một số nguyên.', type: 'video', videoUrl: '' }
      ]
    },
    {
      id: 'm6-c4',
      title: 'CHƯƠNG IV. MỘT SỐ HÌNH PHẲNG TRONG THỰC TIỄN.',
      lessons: [
        { id: 'm6-c4-l18', title: 'Bài 18. Hình tam giác đều. Hình vuông. Hình lục giác đều.', type: 'video', videoUrl: '' },
        { id: 'm6-c4-l19', title: 'Bài 19. Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân.', type: 'video', videoUrl: '' },
        { id: 'm6-c4-l20', title: 'Bài 20. Chu vi và diện tích của một số tứ giác đã học.', type: 'video', videoUrl: '' }
      ]
    },
    {
      id: 'm6-c5',
      title: 'CHƯƠNG V. TÍNH ĐỐI XỨNG CỦA HÌNH PHẲNG TRONG TỰ NHIÊN.',
      lessons: [
        { id: 'm6-c5-l21', title: 'Bài 21. Hình có trục đối xứng.', type: 'video', videoUrl: '' },
        { id: 'm6-c5-l22', title: 'Bài 22. Hình có tâm đối xứng.', type: 'video', videoUrl: '' }
      ]
    },
    {
      id: 'm6-c6',
      title: 'CHƯƠNG VI. PHÂN SỐ.',
      lessons: [
        { id: 'm6-c6-l23', title: 'Bài 23. Mở rộng phân số. Phân số bằng nhau.', type: 'video', videoUrl: '' },
        { id: 'm6-c6-l24', title: 'Bài 24. So sánh phân số. Hỗn số dương.', type: 'video', videoUrl: '' },
        { id: 'm6-c6-l25', title: 'Bài 25. Phép cộng và phép trừ phân số.', type: 'video', videoUrl: '' },
        { id: 'm6-c6-l26', title: 'Bài 26. Phép nhân và phép chia phân số.', type: 'video', videoUrl: '' },
        { id: 'm6-c6-l27', title: 'Bài 27. Hai bài toán về phân số.', type: 'video', videoUrl: '' }
      ]
    },
    {
      id: 'm6-c7',
      title: 'CHƯƠNG VII. SỐ THẬP PHÂN.',
      lessons: [
        { id: 'm6-c7-l28', title: 'Bài 28. Số thập phân.', type: 'video', videoUrl: '' },
        { id: 'm6-c7-l29', title: 'Bài 29. Tính toán với số thập phân.', type: 'video', videoUrl: '' },
        { id: 'm6-c7-l30', title: 'Bài 30. Làm tròn và ước lượng.', type: 'video', videoUrl: '' },
        { id: 'm6-c7-l31', title: 'Bài 31. Một số bài toán về tỉ số và tỉ số phần trăm.', type: 'video', videoUrl: '' }
      ]
    },
    {
      id: 'm6-c8',
      title: 'CHƯƠNG VIII. NHỮNG HÌNH HÌNH HỌC CƠ BẢN.',
      lessons: [
        { id: 'm6-c8-l32', title: 'Bài 32. Điểm và đường thẳng.', type: 'video', videoUrl: '' },
        { id: 'm6-c8-l33', title: 'Bài 33. Điểm nằm giữa hai điểm. Tia.', type: 'video', videoUrl: '' },
        { id: 'm6-c8-l34', title: 'Bài 34. Đoạn thẳng. Độ dài đoạn thẳng.', type: 'video', videoUrl: '' },
        { id: 'm6-c8-l35', title: 'Bài 35. Trung điểm của đoạn thẳng.', type: 'video', videoUrl: '' },
        { id: 'm6-c8-l36', title: 'Bài 36. Góc.', type: 'video', videoUrl: '' },
        { id: 'm6-c8-l37', title: 'Bài 37. Số đo góc.', type: 'video', videoUrl: '' }
      ]
    },
    {
      id: 'm6-c9',
      title: 'CHƯƠNG IX. DỮ LIỆU VÀ XÁC SUẤT THỰC NGHIỆM.',
      lessons: [
        { id: 'm6-c9-l38', title: 'Bài 38. Dữ liệu và thu thập dữ liệu.', type: 'video', videoUrl: '' },
        { id: 'm6-c9-l39', title: 'Bài 39. Bảng thống kê và biểu đồ tranh.', type: 'video', videoUrl: '' },
        { id: 'm6-c9-l40', title: 'Bài 40. Biểu đồ cột.', type: 'video', videoUrl: '' },
        { id: 'm6-c9-l41', title: 'Bài 41. Biểu đồ cột kép.', type: 'video', videoUrl: '' },
        { id: 'm6-c9-l42', title: 'Bài 42. Kết quả có thể và sự kiện trong trò chơi, thí nghiệm.', type: 'video', videoUrl: '' },
        { id: 'm6-c9-l43', title: 'Bài 43. Xác suất thực nghiệm.', type: 'video', videoUrl: '' }
      ]
    }
  ]
};

const MATH_7_COURSE_DATA: Course = {
  id: 'math-7', subjectName: 'Toán', gradeLevel: 7, title: 'Kết nối tri thức',
  chapters: [
    { id: 'm7-c1', title: 'Chương I. SỐ HỮU TỈ', lessons: [
        l('m7-c1-l1', 'Bài 1. Tập hợp các số hữu tỉ'),
        l('m7-c1-l2', 'Bài 2. Cộng, trừ, nhân, chia số hữu tỉ'),
        l('m7-c1-l3', 'Bài 3. Luỹ thừa với số mũ tự nhiên của một số hữu tỉ'),
        l('m7-c1-l4', 'Bài 4. Thứ tự thực hiện các phép tính. Quy tắc chuyển vế')
    ]},
    { id: 'm7-c2', title: 'Chương II. SỐ THỰC', lessons: [
        l('m7-c2-l5', 'Bài 5. Làm quen với số thập phân vô hạn tuần hoàn'),
        l('m7-c2-l6', 'Bài 6. Số vô tỉ. Căn bậc hai số học'),
        l('m7-c2-l7', 'Bài 7. Tập hợp các số thực')
    ]},
    { id: 'm7-c3', title: 'Chương III. GÓC VÀ ĐƯỜNG THẲNG SONG SONG', lessons: [
        l('m7-c3-l8', 'Bài 8. Góc ở vị trí đặc biệt. Tia phân giác của một góc'),
        l('m7-c3-l9', 'Bài 9. Hai đường thẳng song song và dấu hiệu nhận biết'),
        l('m7-c3-l10', 'Bài 10. Tiên đề Euclid. Tính chất của hai đường thẳng song song'),
        l('m7-c3-l11', 'Bài 11. Định lí và chứng minh định lí')
    ]},
    { id: 'm7-c4', title: 'Chương IV. TAM GIÁC BẰNG NHAU', lessons: [
        l('m7-c4-l12', 'Bài 12. Tổng các góc trong một tam giác'),
        l('m7-c4-l13', 'Bài 13. Hai tam giác bằng nhau. Trường hợp bằng nhau thứ nhất'),
        l('m7-c4-l14', 'Bài 14. Trường hợp bằng nhau thứ hai và thứ ba của tam giác'),
        l('m7-c4-l15', 'Bài 15. Các trường hợp bằng nhau của tam giác vuông'),
        l('m7-c4-l16', 'Bài 16. Tam giác cân. Đường trung trực của đoạn thẳng')
    ]},
    { id: 'm7-c5', title: 'Chương V. THU THẬP VÀ BIỂU DIỄN DỮ LIỆU', lessons: [
        l('m7-c5-l17', 'Bài 17. Thu thập và phân loại dữ liệu'),
        l('m7-c5-l18', 'Bài 18. Biểu đồ hình quạt tròn'),
        l('m7-c5-l19', 'Bài 19. Biểu đồ đoạn thẳng')
    ]},
    { id: 'm7-c6', title: 'Chương VI. TỈ LỆ THỨC VÀ ĐẠI LƯỢNG TỈ LỆ', lessons: [
        l('m7-c6-l20', 'Bài 20. Tỉ lệ thức'),
        l('m7-c6-l21', 'Bài 21. Tính chất của dãy tỉ số bằng nhau'),
        l('m7-c6-l22', 'Bài 22. Đại lượng tỉ lệ thuận'),
        l('m7-c6-l23', 'Bài 23. Đại lượng tỉ lệ nghịch')
    ]},
    { id: 'm7-c7', title: 'Chương VII. BIỂU THỨC ĐẠI SỐ VÀ ĐA THỨC MỘT BIẾN', lessons: [
        l('m7-c7-l24', 'Bài 24. Biểu thức đại số'),
        l('m7-c7-l25', 'Bài 25. Đa thức một biến'),
        l('m7-c7-l26', 'Bài 26. Phép cộng và phép trừ đa thức một biến'),
        l('m7-c7-l27', 'Bài 27. Phép nhân đa thức một biến'),
        l('m7-c7-l28', 'Bài 28. Phép chia đa thức một biến')
    ]},
    { id: 'm7-c8', title: 'Chương VIII. LÀM QUEN VỚI BIẾN CỐ VÀ XÁC SUẤT CỦA BIẾN CỐ', lessons: [
        l('m7-c8-l29', 'Bài 29. Làm quen với biến cố'),
        l('m7-c8-l30', 'Bài 30. Làm quen với xác suất của biến cố')
    ]},
    { id: 'm7-c9', title: 'Chương IX. QUAN HỆ GIỮA CÁC YẾU TỐ TRONG MỘT TAM GIÁC', lessons: [
        l('m7-c9-l31', 'Bài 31. Quan hệ giữa góc và cạnh đối diện trong một tam giác'),
        l('m7-c9-l32', 'Bài 32. Quan hệ giữa đường vuông góc và đường xiên'),
        l('m7-c9-l33', 'Bài 33. Quan hệ giữa ba cạnh của một tam giác'),
        l('m7-c9-l34', 'Bài 34. Sự đồng quy của ba trung tuyến, ba đường phân giác'),
        l('m7-c9-l35', 'Bài 35. Sự đồng quy của ba đường trung trực, ba đường cao')
    ]},
    { id: 'm7-c10', title: 'Chương X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN', lessons: [
        l('m7-c10-l36', 'Bài 36. Hình hộp chữ nhật và hình lập phương'),
        l('m7-c10-l37', 'Bài 37. Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác')
    ]}
  ]
};

const MATH_8_COURSE_DATA: Course = {
  id: 'math-8', subjectName: 'Toán', gradeLevel: 8, title: 'Kết nối tri thức',
  chapters: [
    { id: 'm8-c1', title: 'Chương I. ĐA THỨC', lessons: [
        l('m8-c1-l1', 'Bài 1. Đơn thức'),
        l('m8-c1-l2', 'Bài 2. Đa thức'),
        l('m8-c1-l3', 'Bài 3. Phép cộng và phép trừ đa thức'),
        l('m8-c1-l4', 'Bài 4. Phép nhân đa thức'),
        l('m8-c1-l5', 'Bài 5. Phép chia đa thức cho đơn thức')
    ]},
    { id: 'm8-c2', title: 'Chương II. HẰNG ĐẲNG THỨC ĐÁNG NHỚ VÀ ỨNG DỤNG', lessons: [
        l('m8-c2-l6', 'Bài 6. Hiệu hai bình phương. Bình phương của một tổng hay một hiệu'),
        l('m8-c2-l7', 'Bài 7. Lập phương của một tổng hay một hiệu'),
        l('m8-c2-l8', 'Bài 8. Tổng và hiệu hai lập hương'),
        l('m8-c2-l9', 'Bài 9. Phân tích đa thức thành nhân tử')
    ]},
    { id: 'm8-c3', title: 'Chương III. TỨ GIÁC', lessons: [
        l('m8-c3-l10', 'Bài 10. Tứ giác'),
        l('m8-c3-l11', 'Bài 11. Hình thang cân'),
        l('m8-c3-l12', 'Bài 12. Hình bình hành'),
        l('m8-c3-l13', 'Bài 13. Hình chữ nhật'),
        l('m8-c3-l14', 'Bài 14. Hình thoi và hình vuông')
    ]},
    { id: 'm8-c4', title: 'CHƯƠNG IV. ĐỊNH LÍ THALES', lessons: [
        l('m8-c4-l15', 'Bài 15. Định lí Thalès trong tam giác'),
        l('m8-c4-l16', 'Bài 16. Đường trung bình của tam giác'),
        l('m8-c4-l17', 'Bài 17. Tính chất đường phân giác của tam giác')
    ]},
    { id: 'm8-c5', title: 'Chương V. DỮ LIỆU VÀ BIỂU ĐỒ', lessons: [
        l('m8-c5-l18', 'Bài 18. Thu thập và phân loại dữ liệu'),
        l('m8-c5-l19', 'Bài 19. Biểu diễn dữ liệu bằng bảng, biểu đồ'),
        l('m8-c5-l20', 'Bài 20. Phân tích số liệu thống kê dựa vào biểu đó')
    ]},
    { id: 'm8-c6', title: 'Chương VI. PHÂN THỨC ĐẠI SỐ', lessons: [
        l('m8-c6-l21', 'Bài 21. Phần thức đại số'),
        l('m8-c6-l22', 'Bài 22. Tính chất cơ bản của phân thức đại số'),
        l('m8-c6-l23', 'Bài 23. Phép cộng và phép trừ phân thức đại số'),
        l('m8-c6-l24', 'Bài 24. Phép nhân và phép chia phân thức đại số')
    ]},
    { id: 'm8-c7', title: 'Chương VII. PHƯƠNG TRÌNH BẬC NHẤT VÀ HÀM SỐ BẬC NHẤT', lessons: [
        l('m8-c7-l25', 'Bài 25. Phương trình bậc nhất một ẩn'),
        l('m8-c7-l26', 'Bài 26. Giải bài toán bằng cách lập phương trình'),
        l('m8-c7-l27', 'Bài 27. Khái niệm hàm số và đô thị của hàm số'),
        l('m8-c7-l28', 'Bài 28. Hàm số bậc nhất và đô thị của hàm số bậc nhất'),
        l('m8-c7-l29', 'Bài 29. Hệ số góc của đường thẳng')
    ]},
    { id: 'm8-c8', title: 'Chương VIII. MỞ ĐẦU VỀ TÍNH XÁC SUẤT CỦA BIẾN CỐ', lessons: [
        l('m8-c8-l30', 'Bài 30. Kết quả có thể và kết quả thuận lợi'),
        l('m8-c8-l31', 'Bài 31. Cách tính xác suất của biến cố bằng tỉ số'),
        l('m8-c8-l32', 'Bài 32. Mối liên hệ giữa xác suất thực nghiệm với xác suất và ứng dụng')
    ]},
    { id: 'm8-c9', title: 'Chương IX. TAM GIÁC ĐỒNG DẠNG', lessons: [
        l('m8-c9-l33', 'Bài 33. Hai tam giác đồng dạng'),
        l('m8-c9-l34', 'Bài 34. Ba trường hợp đồng dạng của hai tam giác'),
        l('m8-c9-l35', 'Bài 35. Định lí Pythagore và ứng dụng'),
        l('m8-c9-l36', 'Bài 36. Các trường hợp đồng dạng của hai tam giác vuông'),
        l('m8-c9-l37', 'Bài 37. Hình đồng dạng')
    ]},
    { id: 'm8-c10', title: 'Chương X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN', lessons: [
        l('m8-c10-l38', 'Bài 38. Hình chóp tam giác đều'),
        l('m8-c10-l39', 'Bài 39. Hình chóp tứ giác đều')
    ]}
  ]
};

const MATH_9_COURSE_DATA: Course = {
  id: 'math-9', subjectName: 'Toán', gradeLevel: 9, title: 'Kết nối tri thức',
  chapters: [
    { id: 'm9-c1', title: 'Chương I. PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN', lessons: [
        l('m9-c1-l1', 'Bài 1. Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn'),
        l('m9-c1-l2', 'Bài 2. Giải hệ hai phương trình bậc nhất hai ẩn'),
        l('m9-c1-l3', 'Bài 3. Giải bài toán bằng cách lập hệ phương trình')
    ]},
    { id: 'm9-c2', title: 'Chương II. PHƯƠNG TRÌNH VÀ BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN', lessons: [
        l('m9-c2-l4', 'Bài 4. Phương trình quy về phương trình bậc nhất một ẩn'),
        l('m9-c2-l5', 'Bài 5. Bất đẳng thức và tính chất'),
        l('m9-c2-l6', 'Bài 6. Bất phương trình bậc nhất một ẩn')
    ]},
    { id: 'm9-c3', title: 'Chương III. CĂN BẬC HAI VÀ CĂN BẬC BA', lessons: [
        l('m9-c3-l7', 'Bài 7. Căn bậc hai và căn thức bậc hai'),
        l('m9-c3-l8', 'Bài 8. Khai căn bậc hai với phép nhân và phép chia'),
        l('m9-c3-l9', 'Bài 9. Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai'),
        l('m9-c3-l10', 'Bài 10. Căn bậc ba và căn thức bậc ba')
    ]},
    { id: 'm9-c4', title: 'Chương IV. HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG', lessons: [
        l('m9-c4-l11', 'Bài 11. Tỉ số lượng giác của góc nhọn'),
        l('m9-c4-l12', 'Bài 12. Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng')
    ]},
    { id: 'm9-c5', title: 'Chương V. ĐƯỜNG TRÒN', lessons: [
        l('m9-c5-l13', 'Bài 13. Mở đầu về đường tròn'),
        l('m9-c5-l14', 'Bài 14. Cung và dây của một đường tròn'),
        l('m9-c5-l15', 'Bài 15. Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên'),
        l('m9-c5-l16', 'Bài 16. Vị trí tương đối của đường thẳng và đường tròn'),
        l('m9-c5-l17', 'Bài 17. Vị trí tương đối của hai đường tròn')
    ]},
    { id: 'm9-c6', title: 'Chương VI. HÀM SỐ y = ax2 (a khác 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN', lessons: [
        l('m9-c6-l18', 'Bài 18. Hàm số y = ax2 (a ≠ 0)'),
        l('m9-c6-l19', 'Bài 19. Phương trình bậc hai một ẩn'),
        l('m9-c6-l20', 'Bài 20. Định lí Viète và ứng dụng'),
        l('m9-c6-l21', 'Bài 21. Giải bài toán bằng cách lập phương trình')
    ]},
    { id: 'm9-c7', title: 'Chương VII. TẦN SỐ VÀ TẦN SỐ TƯƠNG ĐỐI', lessons: [
        l('m9-c7-l22', 'Bài 22. Bảng tần số và biểu đồ tần số'),
        l('m9-c7-l23', 'Bài 23. Bảng tần số tương đối và biểu đồ tần số tương đối'),
        l('m9-c7-l24', 'Bài 24. Bảng tần số, tần số tương đối ghép nhóm và biểu đồ')
    ]},
    { id: 'm9-c8', title: 'Chương VIII. XÁC SUẤT CỦA BIẾN CỐ TRONG MỘT SỐ MÔ HÌNH XÁC SUẤT ĐƠN GIẢN', lessons: [
        l('m9-c8-l25', 'Bài 25. Phép thử ngẫu nhiên và không gian mẫu'),
        l('m9-c8-l26', 'Bài 26. Xác suất của biến cố liên quan tới phép thử')
    ]},
    { id: 'm9-c9', title: 'Chương IX. ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP', lessons: [
        l('m9-c9-l27', 'Bài 27. Góc nội tiếp'),
        l('m9-c9-l28', 'Bài 28. Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác'),
        l('m9-c9-l29', 'Bài 29. Tứ giác nội tiếp'),
        l('m9-c9-l30', 'Bài 30. Đa giác đều')
    ]},
    { id: 'm9-c10', title: 'Chương X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN', lessons: [
        l('m9-c10-l31', 'Bài 31. Hình trụ và hình nón'),
        l('m9-c10-l32', 'Bài 32. Hình cầu')
    ]}
  ]
};

// =============================================================================
// PHẦN 2: NGỮ VĂN
// =============================================================================

const LIT_6_COURSE_DATA: Course = {
  id: 'lit-6', subjectName: 'Ngữ văn', gradeLevel: 6, title: 'Kết nối tri thức',
  chapters: [
    { id: 'lit6-c1', title: 'Bài 1: Tôi và các bạn', lessons: [
        l('lit6-c1-l1', 'Đọc: Bài học đường đời đầu tiên'),
        l('lit6-c1-l2', 'Đọc: Nếu cậu muốn có một người bạn'),
        l('lit6-c1-l3', 'Thực hành Tiếng Việt: Từ đơn và từ phức'),
        l('lit6-c1-l4', 'Viết: Kể lại một trải nghiệm của bản thân')
    ]},
    { id: 'lit6-c2', title: 'Bài 2: Gõ cửa trái tim', lessons: [
        l('lit6-c2-l5', 'Đọc: Chuyện cổ tích về loài người'),
        l('lit6-c2-l6', 'Đọc: Mây và sóng'),
        l('lit6-c2-l7', 'Thực hành Tiếng Việt: Ẩn dụ')
    ]}
  ]
};

const LIT_7_COURSE_DATA: Course = {
  id: 'lit-7', subjectName: 'Ngữ văn', gradeLevel: 7, title: 'Kết nối tri thức',
  chapters: [
    { id: 'lit7-c1', title: 'Bài 1: Bầu trời tuổi thơ (Truyện ngắn)', lessons: [
        l('lit7-c1-l1', 'Văn bản 1: Bầy chim chìa vôi (Nguyễn Quang Thiều)'),
        l('lit7-c1-l2', 'Văn bản 2: Đi lấy mật (Trích Đất rừng phương Nam)'),
        l('lit7-c1-l3', 'Văn bản 3: Ngàn sao làm việc (Võ Quảng)')
    ]},
    { id: 'lit7-c2', title: 'Bài 2: Khúc nhạc tâm hồn (Thơ bốn chữ, năm chữ)', lessons: [
        l('lit7-c2-l1', 'Văn bản 1: Đồng dao mùa xuân (Nguyễn Khoa Điềm)'),
        l('lit7-c2-l2', 'Văn bản 2: Gặp lá cơm nếp (Thanh Thảo)'),
        l('lit7-c2-l3', 'Văn bản 3: Trở gió (Nguyễn Ngọc Tư)')
    ]},
    { id: 'lit7-c3', title: 'Bài 3: Cội nguồn yêu thương (Truyện)', lessons: [
        l('lit7-c3-l1', 'Văn bản 1: Vừa nhắm mắt vừa mở cửa sổ'),
        l('lit7-c3-l2', 'Văn bản 2: Người thầy đầu tiên'),
        l('lit7-c3-l3', 'Văn bản 3: Quê hương (Tế Hanh)')
    ]},
    { id: 'lit7-c4', title: 'Bài 4: Giai điệu đất nước (Thơ)', lessons: [
        l('lit7-c4-l1', 'Văn bản 1: Mùa xuân nho nhỏ (Thanh Hải)'),
        l('lit7-c4-l2', 'Văn bản 2: Gò Me (Hoàng Tố Nguyên)'),
        l('lit7-c4-l3', 'Văn bản 3: Bài thơ Đường núi của Nguyễn Đình Thi')
    ]},
    { id: 'lit7-c5', title: 'Bài 5: Màu sắc trăm miền (Tùy bút, Tản văn)', lessons: [
        l('lit7-c5-l1', 'Văn bản 1: Tháng Giêng, mơ về trăng non rét ngọt'),
        l('lit7-c5-l2', 'Văn bản 2: Chuyện cơm hến (Hoàng Phủ Ngọc Tường)'),
        l('lit7-c5-l3', 'Văn bản 3: Những khuôn mặt khơi xa (Trần Đăng Khoa)')
    ]},
    { id: 'lit7-c6', title: 'Bài 6: Bài học ngụ ngôn (Truyện ngụ ngôn)', lessons: [
        l('lit7-c6-l1', 'Văn bản 1: Ếch ngồi đáy giếng; Đẽo cày giữa đường'),
        l('lit7-c6-l2', 'Văn bản 2: Tục ngữ và thành ngữ'),
        l('lit7-c6-l3', 'Văn bản 3: Bụng và Chân, Tay, Tai, Mắt (Ê-sốp)')
    ]},
    { id: 'lit7-c7', title: 'Bài 7: Thế giới viễn tưởng (Truyện khoa học viễn tưởng)', lessons: [
        l('lit7-c7-l1', 'Văn bản 1: Cuộc chạm trán trên đại dương'),
        l('lit7-c7-l2', 'Văn bản 2: Đường vào trung tâm vũ trụ (Hà Thủy Nguyên)'),
        l('lit7-c7-l3', 'Văn bản 3: Dấu chân sinh học')
    ]},
    { id: 'lit7-c8', title: 'Bài 8: Trải nghiệm trong đời (Truyện)', lessons: [
        l('lit7-c8-l1', 'Văn bản 1: Bản tin về hoa anh đào (Nguyễn Ngọc Thuần)'),
        l('lit7-c8-l2', 'Văn bản 2: Những tình huống hiểm nghèo (Robinson Crusoe)'),
        l('lit7-c8-l3', 'Văn bản 3: Mẹ (Đỗ Trung Lai)')
    ]},
    { id: 'lit7-c9', title: 'Bài 9: Hòa điệu với tự nhiên (Nghị luận)', lessons: [
        l('lit7-c9-l1', 'Văn bản 1: Thủy tiên tháng Một (Tô-mát L. Phrit-man)'),
        l('lit7-c9-l2', 'Văn bản 2: Lễ rửa làng của người Lô Lô (Vi Hồng Nhân)'),
        l('lit7-c9-l3', 'Văn bản 3: Bản hòa âm ngôn ngữ trong Bản sắc Việt Nam')
    ]},
    { id: 'lit7-c10', title: 'Bài 10: Cuốn sách tôi yêu', lessons: [
        l('lit7-c10-l1', 'Đọc hệ thống & tổng kết')
    ]}
  ]
};

const LIT_8_COURSE_DATA: Course = {
  id: 'lit-8', subjectName: 'Ngữ văn', gradeLevel: 8, title: 'Kết nối tri thức',
  chapters: [
    { id: 'lit8-c1', title: 'Bài 1: Câu chuyện của lịch sử (Truyện lịch sử)', lessons: [
        l('lit8-c1-l1', 'Văn bản 1: Lá cờ thêu sáu chữ vàng (Nguyễn Huy Tưởng)'),
        l('lit8-c1-l2', 'Văn bản 2: Quang Trung đại phá quân Thanh'),
        l('lit8-c1-l3', 'Văn bản 3: Ta đi tới (Tố Hữu)')
    ]},
    { id: 'lit8-c2', title: 'Bài 2: Vẻ đẹp cổ điển (Thơ Đường luật)', lessons: [
        l('lit8-c2-l1', 'Văn bản 1: Thu điếu (Nguyễn Khuyến)'),
        l('lit8-c2-l2', 'Văn bản 2: Thiên Trường vãn vọng (Trần Nhân Tông)'),
        l('lit8-c2-l3', 'Văn bản 3: Ca Huế trên sông Hương (Hà Ánh Minh)')
    ]},
    { id: 'lit8-c3', title: 'Bài 3: Lời sông núi (Văn bản nghị luận - Hùng ca)', lessons: [
        l('lit8-c3-l1', 'Văn bản 1: Chiếu dời đô (Lý Công Uẩn)'),
        l('lit8-c3-l2', 'Văn bản 2: Hịch tướng sĩ (Trần Quốc Tuấn)'),
        l('lit8-c3-l3', 'Văn bản 3: Tinh thần yêu nước của nhân dân ta (Hồ Chí Minh)')
    ]},
    { id: 'lit8-c4', title: 'Bài 4: Sắc thái của tiếng cười (Truyện cười)', lessons: [
        l('lit8-c4-l1', 'Văn bản 1: Trưởng giả học làm sang (Mô-li-e)'),
        l('lit8-c4-l2', 'Văn bản 2: Thi nói khoác; May không đi giày'),
        l('lit8-c4-l3', 'Văn bản 3: Khoe của; Con rắn vuông')
    ]},
    { id: 'lit8-c5', title: 'Bài 5: Những câu chuyện hài hước', lessons: [
        l('lit8-c5-l1', 'Văn bản 1: Ông Giuốc-đanh mặc lễ phục (Mô-li-e)'),
        l('lit8-c5-l2', 'Văn bản 2: Cái kính (A-dít Nê-xin)'),
        l('lit8-c5-l3', 'Văn bản 3: Loại vi trùng quý hiếm (A-dít Nê-xin)')
    ]},
    { id: 'lit8-c6', title: 'Bài 6: Chân dung đời thường (Truyện ngắn hiện đại)', lessons: [
        l('lit8-c6-l1', 'Văn bản 1: Lão Hạc (Nam Cao)'),
        l('lit8-c6-l2', 'Văn bản 2: Trong lòng mẹ (Trích Những ngày thơ ấu)'),
        l('lit8-c6-l3', 'Văn bản 3: Đồng bạc trắng hoa xòe')
    ]},
    { id: 'lit8-c7', title: 'Bài 7: Tin yêu và hy vọng (Thơ hiện đại)', lessons: [
        l('lit8-c7-l1', 'Văn bản 1: Nhớ đồng (Tố Hữu)'),
        l('lit8-c7-l2', 'Văn bản 2: Những chiếc lá thơm tho (Trương Gia Hòa)'),
        l('lit8-c7-l3', 'Văn bản 3: Chùm ca dao về tình yêu quê hương')
    ]},
    { id: 'lit8-c8', title: 'Bài 8: Nhà văn và trang viết', lessons: [
        l('lit8-c8-l1', 'Văn bản 1: Nhà thơ của quê hương làng cảnh Việt Nam'),
        l('lit8-c8-l2', 'Văn bản 2: Đọc kết nối chủ điểm về một tác giả/tác phẩm cụ thể')
    ]},
    { id: 'lit8-c9', title: 'Bài 9: Hòa điệu với tự nhiên (Thơ tự do)', lessons: [
        l('lit8-c9-l1', 'Văn bản 1: Sang thu (Hữu Thỉnh)'),
        l('lit8-c9-l2', 'Văn bản 2: Ông đồ (Vũ Đình Liên)'),
        l('lit8-c9-l3', 'Văn bản 3: Tiếng gà trưa (Xuân Quỳnh)')
    ]},
    { id: 'lit8-c10', title: 'Bài 10: Cuốn sách tôi yêu', lessons: [
        l('lit8-c10-l1', 'Hệ thống hóa và đọc mở rộng')
    ]}
  ]
};

const LIT_9_COURSE_DATA: Course = {
  id: 'lit-9', subjectName: 'Ngữ văn', gradeLevel: 9, title: 'Kết nối tri thức',
  chapters: [
    { id: 'lit9-c1', title: 'Bài 1: Thế giới kì ảo (Truyện truyền kỳ)', lessons: [
        l('lit9-c1-l1', 'Văn bản 1: Chuyện người con gái Nam Xương (Nguyễn Dữ)'),
        l('lit9-c1-l2', 'Văn bản 2: Chuyện cũ trong phủ chúa Trịnh (Phạm Đình Hổ)'),
        l('lit9-c1-l3', 'Văn bản 3: Sơn Tinh, Thủy Tinh (Nguyễn Nhược Pháp)')
    ]},
    { id: 'lit9-c2', title: 'Bài 2: Những hồn thơ cổ điển (Truyện Kiều)', lessons: [
        l('lit9-c2-l1', 'Văn bản 1: Chị em Thúy Kiều (Nguyễn Du)'),
        l('lit9-c2-l2', 'Văn bản 2: Cảnh ngày xuân (Nguyễn Du)'),
        l('lit9-c2-l3', 'Văn bản 3: Kiều ở lầu Ngưng Bích (Nguyễn Du)')
    ]},
    { id: 'lit9-c3', title: 'Bài 3: Khát vọng công lí (Truyện thơ Nôm)', lessons: [
        l('lit9-c3-l1', 'Văn bản 1: Lục Vân Tiên cứu Kiều Nguyệt Nga'),
        l('lit9-c3-l2', 'Văn bản 2: Lục Vân Tiên gặp nạn (Nguyễn Đình Chiểu)')
    ]},
    { id: 'lit9-c4', title: 'Bài 4: Chân dung người chiến sĩ (Thơ hiện đại)', lessons: [
        l('lit9-c4-l1', 'Văn bản 1: Đồng chí (Chính Hữu)'),
        l('lit9-c4-l2', 'Văn bản 2: Bài thơ về tiểu đội xe không kính (Phạm Tiến Duật)'),
        l('lit9-c4-l3', 'Văn bản 3: Những ngôi sao xa xôi (Lê Minh Khuê)')
    ]},
    { id: 'lit9-c5', title: 'Bài 5: Đối thoại với chính mình (Văn bản nghị luận)', lessons: [
        l('lit9-c5-l1', 'Văn bản 1: Chuẩn bị hành trang vào thế kỷ mới (Vũ Khoan)'),
        l('lit9-c5-l2', 'Văn bản 2: Bàn về đọc sách (Chu Quang Tiềm)'),
        l('lit9-c5-l3', 'Văn bản 3: Chó sói và cừu trong thơ ngụ ngôn của La Phông-ten')
    ]},
    { id: 'lit9-c6', title: 'Bài 6: Sống để yêu thương (Truyện ngắn hiện đại)', lessons: [
        l('lit9-c6-l1', 'Văn bản 1: Làng (Kim Lân)'),
        l('lit9-c6-l2', 'Văn bản 2: Lặng lẽ Sa Pa (Nguyễn Thành Long)'),
        l('lit9-c6-l3', 'Văn bản 3: Chiếc lược ngà (Nguyễn Quang Sáng)')
    ]},
    { id: 'lit9-c7', title: 'Bài 7: Những âm vang của thời gian (Thơ hiện đại)', lessons: [
        l('lit9-c7-l1', 'Văn bản 1: Con cò (Chế Lan Viên)'),
        l('lit9-c7-l2', 'Văn bản 2: Mùa xuân nho nhỏ (Thanh Hải)'),
        l('lit9-c7-l3', 'Văn bản 3: Viếng lăng Bác (Viễn Phương)')
    ]},
    { id: 'lit9-c8', title: 'Bài 8: Khám phá vẻ đẹp ngôn ngữ (Thơ tự do và kịch)', lessons: [
        l('lit9-c8-l1', 'Văn bản 1: Sang thu (Hữu Thỉnh)'),
        l('lit9-c8-l2', 'Văn bản 2: Nói với con (Y Phương)'),
        l('lit9-c8-l3', 'Văn bản 3: Bắc Sơn (Nguyễn Huy Tưởng)')
    ]},
    { id: 'lit9-c9', title: 'Bài 9: Tiếng nói của tư tưởng, tình cảm', lessons: [
        l('lit9-c9-l1', 'Văn bản 1: Tiếng nói của văn nghệ (Nguyễn Đình Thi)'),
        l('lit9-c9-l2', 'Văn bản 2: Yêu và đồng cảm (Phong Tử Khải)')
    ]},
    { id: 'lit9-c10', title: 'Bài 10: Nhìn lại chặng đường đã qua', lessons: [
        l('lit9-c10-l1', 'Hệ thống hóa và tổng kết')
    ]}
  ]
};

// =============================================================================
// PHẦN 3: TIẾNG ANH (GLOBAL SUCCESS)
// =============================================================================

const ENG_6_COURSE_DATA: Course = {
  id: 'eng-6', subjectName: 'Tiếng Anh', gradeLevel: 6, title: 'Global Success',
  chapters: [
    { id: 'eng6-u1', title: 'Unit 1: My New School', lessons: [
        l('eng6-u1-l1', 'Từ vựng: Đồ dùng học tập, môn học'),
        l('eng6-u1-l2', 'Ngữ pháp: Present Simple, Trạng từ tần suất')
    ]},
    { id: 'eng6-u2', title: 'Unit 2: My House', lessons: [
        l('eng6-u2-l1', 'Từ vựng: Các loại nhà, phòng, đồ đạc'),
        l('eng6-u2-l2', 'Ngữ pháp: Sở hữu cách, Giới từ chỉ vị trí')
    ]},
    { id: 'eng6-u3', title: 'Unit 3: My Friends', lessons: [
        l('eng6-u3-l1', 'Từ vựng: Bộ phận cơ thể, tính cách'),
        l('eng6-u3-l2', 'Ngữ pháp: Present Continuous')
    ]},
    { id: 'eng6-r1', title: 'Review 1 (Units 1-2-3)', lessons: [l('eng6-r1-l1', 'Ôn tập Units 1-3')]},
    { id: 'eng6-u4', title: 'Unit 4: My Neighbourhood', lessons: [
        l('eng6-u4-l1', 'Từ vựng: Địa điểm khu phố, tính từ'),
        l('eng6-u4-l2', 'Ngữ pháp: So sánh hơn của tính từ')
    ]},
    { id: 'eng6-u5', title: 'Unit 5: Natural Wonders of the Viet Nam', lessons: [
        l('eng6-u5-l1', 'Từ vựng: Địa danh, đồ du lịch'),
        l('eng6-u5-l2', 'Ngữ pháp: Danh từ đếm được/không đếm được, Must/Mustn\'t')
    ]},
    { id: 'eng6-u6', title: 'Unit 6: Our Tet Holiday', lessons: [
        l('eng6-u6-l1', 'Từ vựng: Ngày Tết'),
        l('eng6-u6-l2', 'Ngữ pháp: Should/Shouldn\'t')
    ]},
    { id: 'eng6-r2', title: 'Review 2 (Units 4-5-6)', lessons: [l('eng6-r2-l1', 'Ôn tập Units 4-6')]},
    { id: 'eng6-u7', title: 'Unit 7: Television', lessons: [
        l('eng6-u7-l1', 'Từ vựng: Chương trình TV'),
        l('eng6-u7-l2', 'Ngữ pháp: Wh-questions, Conjunctions')
    ]},
    { id: 'eng6-u8', title: 'Unit 8: Sports and Games', lessons: [
        l('eng6-u8-l1', 'Từ vựng: Thể thao'),
        l('eng6-u8-l2', 'Ngữ pháp: Past Simple, Imperatives')
    ]},
    { id: 'eng6-u9', title: 'Unit 9: Cities of the World', lessons: [
        l('eng6-u9-l1', 'Từ vựng: Thành phố thế giới'),
        l('eng6-u9-l2', 'Ngữ pháp: So sánh nhất, Present Perfect')
    ]},
    { id: 'eng6-r3', title: 'Review 3 (Units 7-8-9)', lessons: [l('eng6-r3-l1', 'Ôn tập Units 7-9')]},
    { id: 'eng6-u10', title: 'Unit 10: Our Houses in the Future', lessons: [
        l('eng6-u10-l1', 'Từ vựng: Nhà tương lai, thiết bị'),
        l('eng6-u10-l2', 'Ngữ pháp: Future Simple, Might')
    ]},
    { id: 'eng6-u11', title: 'Unit 11: Our Greener World', lessons: [
        l('eng6-u11-l1', 'Từ vựng: Môi trường, 3Rs'),
        l('eng6-u11-l2', 'Ngữ pháp: Câu điều kiện loại 1')
    ]},
    { id: 'eng6-u12', title: 'Unit 12: Robots', lessons: [
        l('eng6-u12-l1', 'Từ vựng: Robot và khả năng'),
        l('eng6-u12-l2', 'Ngữ pháp: Can/Could, So sánh trạng từ')
    ]},
    { id: 'eng6-r4', title: 'Review 4 (Units 10-11-12)', lessons: [l('eng6-r4-l1', 'Ôn tập Units 10-12')]}
  ]
};

const ENG_7_COURSE_DATA: Course = {
  id: 'eng-7', subjectName: 'Tiếng Anh', gradeLevel: 7, title: 'Global Success',
  chapters: [
    { id: 'eng7-u1', title: 'Unit 1: Hobbies', lessons: [
        l('eng7-u1-l1', 'Từ vựng: Sở thích'),
        l('eng7-u1-l2', 'Ngữ pháp: Present Simple, Verbs of liking + V-ing')
    ]},
    { id: 'eng7-u2', title: 'Unit 2: Healthy Living', lessons: [
        l('eng7-u2-l1', 'Từ vựng: Sức khỏe'),
        l('eng7-u2-l2', 'Ngữ pháp: Câu đơn, Câu ghép')
    ]},
    { id: 'eng7-u3', title: 'Unit 3: Community Service', lessons: [
        l('eng7-u3-l1', 'Từ vựng: Phục vụ cộng đồng'),
        l('eng7-u3-l2', 'Ngữ pháp: Past Simple, Present Perfect')
    ]},
    { id: 'eng7-r1', title: 'Review 1 (Units 1-2-3)', lessons: [l('eng7-r1-l1', 'Ôn tập Units 1-3')]},
    { id: 'eng7-u4', title: 'Unit 4: Music and Arts', lessons: [
        l('eng7-u4-l1', 'Từ vựng: Âm nhạc, Nghệ thuật'),
        l('eng7-u4-l2', 'Ngữ pháp: So sánh (as...as, different from)')
    ]},
    { id: 'eng7-u5', title: 'Unit 5: Food and Drink', lessons: [
        l('eng7-u5-l1', 'Từ vựng: Đồ ăn thức uống'),
        l('eng7-u5-l2', 'Ngữ pháp: Danh từ đếm được/không đếm được, lượng từ')
    ]},
    { id: 'eng7-u6', title: 'Unit 6: A Visit to School', lessons: [
        l('eng7-u6-l1', 'Từ vựng: Trường học'),
        l('eng7-u6-l2', 'Ngữ pháp: Giới từ chỉ thời gian, nơi chốn')
    ]},
    { id: 'eng7-r2', title: 'Review 2 (Units 4-5-6)', lessons: [l('eng7-r2-l1', 'Ôn tập Units 4-6')]},
    { id: 'eng7-u7', title: 'Unit 7: Traffic', lessons: [
        l('eng7-u7-l1', 'Từ vựng: Giao thông'),
        l('eng7-u7-l2', 'Ngữ pháp: It indicates distance, Used to')
    ]},
    { id: 'eng7-u8', title: 'Unit 8: Films', lessons: [
        l('eng7-u8-l1', 'Từ vựng: Phim ảnh'),
        l('eng7-u8-l2', 'Ngữ pháp: Liên từ (although, however)')
    ]},
    { id: 'eng7-u9', title: 'Unit 9: Festivals around the World', lessons: [
        l('eng7-u9-l1', 'Từ vựng: Lễ hội'),
        l('eng7-u9-l2', 'Ngữ pháp: Trạng từ bổ nghĩa cho câu')
    ]},
    { id: 'eng7-r3', title: 'Review 3 (Units 7-8-9)', lessons: [l('eng7-r3-l1', 'Ôn tập Units 7-9')]},
    { id: 'eng7-u10', title: 'Unit 10: Energy Sources', lessons: [
        l('eng7-u10-l1', 'Từ vựng: Năng lượng'),
        l('eng7-u10-l2', 'Ngữ pháp: Future Continuous')
    ]},
    { id: 'eng7-u11', title: 'Unit 11: Travelling in the Future', lessons: [
        l('eng7-u11-l1', 'Từ vựng: Du lịch tương lai'),
        l('eng7-u11-l2', 'Ngữ pháp: Đại từ sở hữu')
    ]},
    { id: 'eng7-u12', title: 'Unit 12: English Speaking Countries', lessons: [
        l('eng7-u12-l1', 'Từ vựng: Các nước nói tiếng Anh'),
        l('eng7-u12-l2', 'Ngữ pháp: Mạo từ (a/an/the)')
    ]},
    { id: 'eng7-r4', title: 'Review 4 (Units 10-11-12)', lessons: [l('eng7-r4-l1', 'Ôn tập Units 10-12')]}
  ]
};

const ENG_8_COURSE_DATA: Course = {
  id: 'eng-8', subjectName: 'Tiếng Anh', gradeLevel: 8, title: 'Global Success',
  chapters: [
    { id: 'eng8-u1', title: 'Unit 1: Leisure Time', lessons: [l('eng8-u1-l1', 'Verbs of liking + Gerunds/To-V')]},
    { id: 'eng8-u2', title: 'Unit 2: Life in the Countryside', lessons: [l('eng8-u2-l1', 'Comparative adverbs')]},
    { id: 'eng8-u3', title: 'Unit 3: Teenagers', lessons: [l('eng8-u3-l1', 'Simple, Compound & Complex sentences')]},
    { id: 'eng8-r1', title: 'Review 1 (Units 1-2-3)', lessons: [l('eng8-r1-l1', 'Ôn tập Units 1-3')]},
    { id: 'eng8-u4', title: 'Unit 4: Ethnic Groups of Viet Nam', lessons: [l('eng8-u4-l1', 'Wh-questions & Countable/Uncountable nouns')]},
    { id: 'eng8-u5', title: 'Unit 5: Our Customs and Traditions', lessons: [l('eng8-u5-l1', 'Articles (a, an, the, zero article)')]},
    { id: 'eng8-u6', title: 'Unit 6: Lifestyles', lessons: [l('eng8-u6-l1', 'Future Simple & First Conditional')]},
    { id: 'eng8-r2', title: 'Review 2 (Units 4-5-6)', lessons: [l('eng8-r2-l1', 'Ôn tập Units 4-6')]},
    { id: 'eng8-u7', title: 'Unit 7: Environmental Protection', lessons: [l('eng8-u7-l1', 'Complex sentences with time clauses')]},
    { id: 'eng8-u8', title: 'Unit 8: Shopping', lessons: [l('eng8-u8-l1', 'Present Simple for future & Adverbs of frequency')]},
    { id: 'eng8-u9', title: 'Unit 9: Natural Disasters', lessons: [l('eng8-u9-l1', 'Past Continuous')]},
    { id: 'eng8-r3', title: 'Review 3 (Units 7-8-9)', lessons: [l('eng8-r3-l1', 'Ôn tập Units 7-9')]},
    { id: 'eng8-u10', title: 'Unit 10: Communication in the Future', lessons: [l('eng8-u10-l1', 'Reported Speech (Statements)')]},
    { id: 'eng8-u11', title: 'Unit 11: Science and Technology', lessons: [l('eng8-u11-l1', 'Reported Speech (Questions)')]},
    { id: 'eng8-u12', title: 'Unit 12: Life on Other Planets', lessons: [l('eng8-u12-l1', 'May/Might & Conditional sentences')]},
    { id: 'eng8-r4', title: 'Review 4 (Units 10-11-12)', lessons: [l('eng8-r4-l1', 'Ôn tập Units 10-12')]}
  ]
};

const ENG_9_COURSE_DATA: Course = {
  id: 'eng-9', subjectName: 'Tiếng Anh', gradeLevel: 9, title: 'Global Success',
  chapters: [
    { id: 'eng9-u1', title: 'Unit 1: Local Community', lessons: [l('eng9-u1-l1', 'Complex sentences & Phrasal verbs')]},
    { id: 'eng9-u2', title: 'Unit 2: City Life', lessons: [l('eng9-u2-l1', 'Comparisons of adjectives and adverbs')]},
    { id: 'eng9-u3', title: 'Unit 3: Teen Stress and Pressure', lessons: [l('eng9-u3-l1', 'Reported speech & Wh-words + to-infinitive')]},
    { id: 'eng9-r1', title: 'Review 1 (Units 1-2-3)', lessons: [l('eng9-r1-l1', 'Ôn tập Units 1-3')]},
    { id: 'eng9-u4', title: 'Unit 4: Remembering the Past', lessons: [l('eng9-u4-l1', 'Used to & Wish (present)')]},
    { id: 'eng9-u5', title: 'Unit 5: Our Viet Nam', lessons: [l('eng9-u5-l1', 'Impersonal passive (It is said that...)')]},
    { id: 'eng9-u6', title: 'Unit 6: Viet Nam: Then and Now', lessons: [l('eng9-u6-l1', 'Past tenses & It + be + adj + that-clause')]},
    { id: 'eng9-r2', title: 'Review 2 (Units 4-5-6)', lessons: [l('eng9-r2-l1', 'Ôn tập Units 4-6')]},
    { id: 'eng9-u7', title: 'Unit 7: Natural Wonders of the World', lessons: [l('eng9-u7-l1', 'Passive voice with modals')]},
    { id: 'eng9-u8', title: 'Unit 8: Tourism', lessons: [l('eng9-u8-l1', 'Articles (Advanced)')]},
    { id: 'eng9-u9', title: 'Unit 9: World Englishes', lessons: [l('eng9-u9-l1', 'Relative clauses')]},
    { id: 'eng9-r3', title: 'Review 3 (Units 7-8-9)', lessons: [l('eng9-r3-l1', 'Ôn tập Units 7-9')]},
    { id: 'eng9-u10', title: 'Unit 10: Planet Earth', lessons: [l('eng9-u10-l1', 'Conditional sentence Type 2')]},
    { id: 'eng9-u11', title: 'Unit 11: Electronic Devices', lessons: [l('eng9-u11-l1', 'Reported Speech (Advanced)')]},
    { id: 'eng9-u12', title: 'Unit 12: Career Choices', lessons: [l('eng9-u12-l1', 'Gerunds and Infinitives')]},
    { id: 'eng9-r4', title: 'Review 4 (Units 10-11-12)', lessons: [l('eng9-r4-l1', 'Ôn tập Units 10-12')]}
  ]
};

// =============================================================================
// PHẦN 4: KHOA HỌC TỰ NHIÊN (KẾT NỐI TRI THỨC)
// =============================================================================

const SCI_6_COURSE_DATA: Course = {
  id: 'sci-6', subjectName: 'KHTN', gradeLevel: 6, title: 'Kết nối tri thức',
  chapters: [
    { id: 'sci6-c1', title: 'CHƯƠNG I – MỞ ĐẦU VỀ KHOA HỌC TỰ NHIÊN', lessons: [
        l('sci6-c1-l1', 'Bài 1. Giới thiệu về Khoa học tự nhiên'),
        l('sci6-c1-l2', 'Bài 2. An toàn trong phòng thực hành'),
        l('sci6-c1-l3', 'Bài 3. Sử dụng kính lúp'),
        l('sci6-c1-l4', 'Bài 4. Sử dụng kính hiển vi quang học'),
        l('sci6-c1-l5', 'Bài 5. Đo chiều dài'),
        l('sci6-c1-l6', 'Bài 6. Đo khối lượng'),
        l('sci6-c1-l7', 'Bài 7. Đo thời gian'),
        l('sci6-c1-l8', 'Bài 8. Đo nhiệt độ')
    ]},
    { id: 'sci6-c2', title: 'CHƯƠNG II – CHẤT QUANH TA', lessons: [
        l('sci6-c2-l9', 'Bài 9. Sự đa dạng của chất'),
        l('sci6-c2-l10', 'Bài 10. Các thể của chất và sự chuyển thể'),
        l('sci6-c2-l11', 'Bài 11. Oxygen. Không khí')
    ]},
    { id: 'sci6-c3', title: 'CHƯƠNG III – MỘT SỐ VẬT LIỆU, NGUYÊN LIỆU...', lessons: [
        l('sci6-c3-l12', 'Bài 12. Một số vật liệu'),
        l('sci6-c3-l13', 'Bài 13. Một số nguyên liệu'),
        l('sci6-c3-l14', 'Bài 14. Một số nhiên liệu'),
        l('sci6-c3-l15', 'Bài 15. Một số lương thực, thực phẩm')
    ]},
    { id: 'sci6-c4', title: 'CHƯƠNG IV – HỖN HỢP. TÁCH CHẤT', lessons: [
        l('sci6-c4-l16', 'Bài 16. Hỗn hợp các chất'),
        l('sci6-c4-l17', 'Bài 17. Tách chất khỏi hỗn hợp')
    ]},
    { id: 'sci6-c5', title: 'CHƯƠNG V – TẾ BÀO', lessons: [
        l('sci6-c5-l18', 'Bài 18. Tế bào – Đơn vị cơ bản của sự sống'),
        l('sci6-c5-l19', 'Bài 19. Cấu tạo và chức năng các thành phần của tế bào'),
        l('sci6-c5-l20', 'Bài 20. Sự lớn lên và sinh sản của tế bào'),
        l('sci6-c5-l21', 'Bài 21. Thực hành: Quan sát và phân biệt một số loại tế bào')
    ]},
    { id: 'sci6-c6', title: 'CHƯƠNG VI – TỪ TẾ BÀO ĐẾN CƠ THỂ', lessons: [
        l('sci6-c6-l22', 'Bài 22. Cơ thể sinh vật'),
        l('sci6-c6-l23', 'Bài 23. Tổ chức cơ thể đa bào'),
        l('sci6-c6-l24', 'Bài 24. Thực hành: Quan sát và mô tả cơ thể đơn bào, đa bào')
    ]},
    { id: 'sci6-c7', title: 'CHƯƠNG VII – ĐA DẠNG THẾ GIỚI SỐNG', lessons: [
        l('sci6-c7-l25', 'Bài 25. Hệ thống phân loại sinh vật'),
        l('sci6-c7-l26', 'Bài 26. Khoá lưỡng phân'),
        l('sci6-c7-l27', 'Bài 27. Vi khuẩn'),
        l('sci6-c7-l28', 'Bài 28. Thực hành: Làm sữa chua và quan sát vi khuẩn'),
        l('sci6-c7-l29', 'Bài 29. Virus'),
        l('sci6-c7-l30', 'Bài 30. Nguyên sinh vật'),
        l('sci6-c7-l31', 'Bài 31. Thực hành: Quan sát nguyên sinh vật'),
        l('sci6-c7-l32', 'Bài 32. Nấm'),
        l('sci6-c7-l33', 'Bài 33. Thực hành: Quan sát các loại nấm'),
        l('sci6-c7-l34', 'Bài 34. Thực vật'),
        l('sci6-c7-l35', 'Bài 35. Thực hành: Quan sát và phân biệt một số nhóm thực vật'),
        l('sci6-c7-l36', 'Bài 36. Động vật'),
        l('sci6-c7-l37', 'Bài 37. Thực hành: Quan sát và nhận biết động vật'),
        l('sci6-c7-l38', 'Bài 38. Đa dạng sinh học'),
        l('sci6-c7-l39', 'Bài 39. Tìm hiểu sinh vật ngoài thiên nhiên')
    ]},
    { id: 'sci6-c8', title: 'CHƯƠNG VIII – LỰC TRONG ĐỜI SỐNG', lessons: [
        l('sci6-c8-l40', 'Bài 40. Lực là gì?'),
        l('sci6-c8-l41', 'Bài 41. Biểu diễn lực'),
        l('sci6-c8-l42', 'Bài 42. Biến dạng của lò xo'),
        l('sci6-c8-l43', 'Bài 43. Trọng lượng, lực hấp dẫn'),
        l('sci6-c8-l44', 'Bài 44. Lực ma sát'),
        l('sci6-c8-l45', 'Bài 45. Lực cản của nước')
    ]},
    { id: 'sci6-c9', title: 'CHƯƠNG IX – NĂNG LƯỢNG', lessons: [
        l('sci6-c9-l46', 'Bài 46. Năng lượng và sự truyền năng lượng'),
        l('sci6-c9-l47', 'Bài 47. Một số dạng năng lượng'),
        l('sci6-c9-l48', 'Bài 48. Sự chuyển hoá năng lượng'),
        l('sci6-c9-l49', 'Bài 49. Năng lượng hao phí'),
        l('sci6-c9-l50', 'Bài 50. Năng lượng tái tạo'),
        l('sci6-c9-l51', 'Bài 51. Tiết kiệm năng lượng')
    ]},
    { id: 'sci6-c10', title: 'CHƯƠNG X – TRÁI ĐẤT VÀ BẦU TRỜI', lessons: [
        l('sci6-c10-l52', 'Bài 52. Chuyển động nhìn thấy của Mặt Trời. Thiên thể'),
        l('sci6-c10-l53', 'Bài 53. Mặt Trăng'),
        l('sci6-c10-l54', 'Bài 54. Hệ Mặt Trời'),
        l('sci6-c10-l55', 'Bài 55. Ngân Hà')
    ]}
  ]
};

const SCI_7_COURSE_DATA: Course = {
  id: 'sci-7', subjectName: 'KHTN', gradeLevel: 7, title: 'Kết nối tri thức',
  chapters: [
    { id: 'sci7-c1', title: 'Chương 1: Nguyên tử. Sơ lược bảng tuần hoàn', lessons: [
        l('sci7-c1-l1', 'Bài 1. Phương pháp và kĩ năng học tập môn KHTN'),
        l('sci7-c1-l2', 'Bài 2. Nguyên tử'),
        l('sci7-c1-l3', 'Bài 3. Nguyên tố hóa học'),
        l('sci7-c1-l4', 'Bài 4. Sơ lược về bảng tuần hoàn các nguyên tố hóa học')
    ]},
    { id: 'sci7-c2', title: 'Chương 2: Phân tử. Liên kết hóa học', lessons: [
        l('sci7-c2-l5', 'Bài 5. Phân tử - Đơn chất - Hợp chất'),
        l('sci7-c2-l6', 'Bài 6. Giới thiệu về liên kết hóa học'),
        l('sci7-c2-l7', 'Bài 7. Hóa trị và công thức hóa học')
    ]},
    { id: 'sci7-c3', title: 'Chương 3: Tốc độ', lessons: [
        l('sci7-c3-l8', 'Bài 8. Tốc độ chuyển động'),
        l('sci7-c3-l9', 'Bài 9. Đo tốc độ'),
        l('sci7-c3-l10', 'Bài 10. Đồ thị quãng đường - thời gian'),
        l('sci7-c3-l11', 'Bài 11. Thảo luận về ảnh hưởng của tốc độ trong an toàn giao thông')
    ]},
    { id: 'sci7-c4', title: 'Chương 4: Âm thanh', lessons: [
        l('sci7-c4-l12', 'Bài 12. Sóng âm'),
        l('sci7-c4-l13', 'Bài 13. Độ to và độ cao của âm'),
        l('sci7-c4-l14', 'Bài 14. Phản xạ âm, chống ô nhiễm tiếng ồn')
    ]},
    { id: 'sci7-c5', title: 'Chương 5: Ánh sáng', lessons: [
        l('sci7-c5-l15', 'Bài 15. Năng lượng ánh sáng. Tia sáng, vùng tối'),
        l('sci7-c5-l16', 'Bài 16. Sự phản xạ ánh sáng'),
        l('sci7-c5-l17', 'Bài 17. Ảnh của vật qua gương phẳng')
    ]},
    { id: 'sci7-c6', title: 'Chương 6: Từ', lessons: [
        l('sci7-c6-l18', 'Bài 18. Nam châm'),
        l('sci7-c6-l19', 'Bài 19. Từ trường'),
        l('sci7-c6-l20', 'Bài 20. Chế tạo nam châm điện đơn giản')
    ]},
    { id: 'sci7-c7', title: 'Chương 7: Trao đổi chất và chuyển hóa năng lượng', lessons: [
        l('sci7-c7-l21', 'Bài 21. Khái quát về trao đổi chất và chuyển hóa năng lượng'),
        l('sci7-c7-l22', 'Bài 22. Quang hợp ở thực vật'),
        l('sci7-c7-l23', 'Bài 23. Một số yếu tố ảnh hưởng đến quang hợp'),
        l('sci7-c7-l24', 'Bài 24. Thực hành: Chứng minh quang hợp ở cây xanh'),
        l('sci7-c7-l25', 'Bài 25. Hô hấp tế bào'),
        l('sci7-c7-l26', 'Bài 26. Một số yếu tố ảnh hưởng đến hô hấp tế bào'),
        l('sci7-c7-l27', 'Bài 27. Thực hành: Hô hấp ở thực vật'),
        l('sci7-c7-l28', 'Bài 28. Trao đổi khí ở sinh vật'),
        l('sci7-c7-l29', 'Bài 29. Vai trò của nước và chất dinh dưỡng'),
        l('sci7-c7-l30', 'Bài 30. Trao đổi nước và chất dinh dưỡng ở thực vật'),
        l('sci7-c7-l31', 'Bài 31. Trao đổi nước và chất dinh dưỡng ở động vật'),
        l('sci7-c7-l32', 'Bài 32. Thực hành: Chứng minh thân vận chuyển nước và lá thoát hơi nước')
    ]},
    { id: 'sci7-c8', title: 'Chương 8: Cảm ứng ở sinh vật', lessons: [
        l('sci7-c8-l33', 'Bài 33. Cảm ứng ở sinh vật và tập tính ở động vật'),
        l('sci7-c8-l34', 'Bài 34. Vận dụng hiện tượng cảm ứng ở sinh vật vào thực tiễn'),
        l('sci7-c8-l35', 'Bài 35. Thực hành: Cảm ứng ở sinh vật')
    ]},
    { id: 'sci7-c9', title: 'Chương 9: Sinh trưởng và phát triển', lessons: [
        l('sci7-c9-l36', 'Bài 36. Khái quát về sinh trưởng và phát triển ở sinh vật'),
        l('sci7-c9-l37', 'Bài 37. Ứng dụng sinh trưởng và phát triển ở sinh vật vào thực tiễn'),
        l('sci7-c9-l38', 'Bài 38. Thực hành: Quan sát, mô tả sự sinh trưởng và phát triển')
    ]},
    { id: 'sci7-c10', title: 'Chương 10: Sinh sản ở sinh vật', lessons: [
        l('sci7-c10-l39', 'Bài 39. Sinh sản vô tính ở sinh vật'),
        l('sci7-c10-l40', 'Bài 40. Sinh sản hữu tính ở sinh vật'),
        l('sci7-c10-l41', 'Bài 41. Một số yếu tố ảnh hưởng và điều hòa, điều khiển sinh sản'),
        l('sci7-c10-l42', 'Bài 42. Cơ thể sinh vật là một thể thống nhất')
    ]}
  ]
};

const SCI_8_COURSE_DATA: Course = {
  id: 'sci-8', subjectName: 'KHTN', gradeLevel: 8, title: 'Kết nối tri thức',
  chapters: [
    { id: 'sci8-c1', title: 'Chương 1: Phản ứng hóa học', lessons: [
        l('sci8-c1-l1', 'Bài 1. Sử dụng một số hóa chất, thiết bị cơ bản'),
        l('sci8-c1-l2', 'Bài 2. Phản ứng hóa học'),
        l('sci8-c1-l3', 'Bài 3. Mol và tỉ khối chất khí'),
        l('sci8-c1-l4', 'Bài 4. Dung dịch và nồng độ'),
        l('sci8-c1-l5', 'Bài 5. Định luật bảo toàn khối lượng và phương trình hóa học'),
        l('sci8-c1-l6', 'Bài 6. Tính theo phương trình hóa học'),
        l('sci8-c1-l7', 'Bài 7. Tốc độ phản ứng và chất xúc tác')
    ]},
    { id: 'sci8-c2', title: 'Chương 2: Một số hợp chất thông dụng', lessons: [
        l('sci8-c2-l8', 'Bài 8. Acid'),
        l('sci8-c2-l9', 'Bài 9. Base. Thang pH'),
        l('sci8-c2-l10', 'Bài 10. Oxide'),
        l('sci8-c2-l11', 'Bài 11. Muối'),
        l('sci8-c2-l12', 'Bài 12. Phân bón hóa học')
    ]},
    { id: 'sci8-c3', title: 'Chương 3: Khối lượng riêng và áp suất', lessons: [
        l('sci8-c3-l13', 'Bài 13. Khối lượng riêng'),
        l('sci8-c3-l14', 'Bài 14. Thực hành xác định khối lượng riêng'),
        l('sci8-c3-l15', 'Bài 15. Áp suất trên một bề mặt'),
        l('sci8-c3-l16', 'Bài 16. Áp suất chất lỏng. Áp suất khí quyển'),
        l('sci8-c3-l17', 'Bài 17. Lực đẩy Archimedes')
    ]},
    { id: 'sci8-c4', title: 'Chương 4: Tác dụng làm quay của lực', lessons: [
        l('sci8-c4-l18', 'Bài 18. Tác dụng làm quay của lực. Moment lực'),
        l('sci8-c4-l19', 'Bài 19. Đòn bẩy và ứng dụng')
    ]},
    { id: 'sci8-c5', title: 'Chương 5: Điện', lessons: [
        l('sci8-c5-l20', 'Bài 20. Hiện tượng nhiễm điện do cọ xát'),
        l('sci8-c5-l21', 'Bài 21. Dòng điện, nguồn điện'),
        l('sci8-c5-l22', 'Bài 22. Mạch điện đơn giản'),
        l('sci8-c5-l23', 'Bài 23. Tác dụng của dòng điện'),
        l('sci8-c5-l24', 'Bài 24. Cường độ dòng điện và hiệu điện thế'),
        l('sci8-c5-l25', 'Bài 25. Thực hành đo cường độ dòng điện và hiệu điện thế')
    ]},
    { id: 'sci8-c6', title: 'Chương 6: Nhiệt', lessons: [
        l('sci8-c6-l26', 'Bài 26. Năng lượng nhiệt và nội năng'),
        l('sci8-c6-l27', 'Bài 27. Thực hành đo năng lượng nhiệt bằng joulemeter'),
        l('sci8-c6-l28', 'Bài 28. Sự truyền nhiệt'),
        l('sci8-c6-l29', 'Bài 29. Sự nở vì nhiệt')
    ]},
    { id: 'sci8-c7', title: 'Chương 7: Sinh học cơ thể người', lessons: [
        l('sci8-c7-l30', 'Bài 30. Khái quát về cơ thể người'),
        l('sci8-c7-l31', 'Bài 31. Hệ vận động ở người'),
        l('sci8-c7-l32', 'Bài 32. Dinh dưỡng và tiêu hóa ở người'),
        l('sci8-c7-l33', 'Bài 33. Máu và hệ tuần hoàn của cơ thể người'),
        l('sci8-c7-l34', 'Bài 34. Hệ hô hấp ở người'),
        l('sci8-c7-l35', 'Bài 35. Hệ bài tiết ở người'),
        l('sci8-c7-l36', 'Bài 36. Điều hòa môi trường trong của cơ thể người'),
        l('sci8-c7-l37', 'Bài 37. Hệ thần kinh và các giác quan ở người'),
        l('sci8-c7-l38', 'Bài 38. Hệ nội tiết ở người'),
        l('sci8-c7-l39', 'Bài 39. Da và điều hòa thân nhiệt ở người'),
        l('sci8-c7-l40', 'Bài 40. Sinh sản ở người')
    ]},
    { id: 'sci8-c8', title: 'Chương 8: Sinh vật và môi trường', lessons: [
        l('sci8-c8-l41', 'Bài 41. Môi trường và các nhân tố sinh thái'),
        l('sci8-c8-l42', 'Bài 42. Quần thể sinh vật'),
        l('sci8-c8-l43', 'Bài 43. Quần xã sinh vật'),
        l('sci8-c8-l44', 'Bài 44. Hệ sinh thái'),
        l('sci8-c8-l45', 'Bài 45. Sinh quyển'),
        l('sci8-c8-l46', 'Bài 46. Cân bằng tự nhiên')
    ]}
  ]
};

const SCI_9_COURSE_DATA: Course = {
  id: 'sci-9', subjectName: 'KHTN', gradeLevel: 9, title: 'Kết nối tri thức',
  chapters: [
    { id: 'sci9-c1', title: 'Chương 1: Năng lượng cơ học', lessons: [
        l('sci9-c1-l1', 'Bài 1. Nhận biết dụng cụ hóa chất. Thuyết trình vấn đề'),
        l('sci9-c1-l2', 'Bài 2. Động năng. Thế năng'),
        l('sci9-c1-l3', 'Bài 3. Cơ năng'),
        l('sci9-c1-l4', 'Bài 4. Công và công suất')
    ]},
    { id: 'sci9-c2', title: 'Chương 2: Ánh sáng', lessons: [
        l('sci9-c2-l5', 'Bài 5. Khúc xạ ánh sáng'),
        l('sci9-c2-l6', 'Bài 6. Phản xạ toàn phần'),
        l('sci9-c2-l7', 'Bài 7. Lăng kính'),
        l('sci9-c2-l8', 'Bài 8. Thấu kính'),
        l('sci9-c2-l9', 'Bài 9. Thực hành đo tiêu cự của thấu kính hội tụ'),
        l('sci9-c2-l10', 'Bài 10. Kính lúp. Bài tập thấu kính')
    ]},
    { id: 'sci9-c3', title: 'Chương 3: Điện', lessons: [
        l('sci9-c3-l11', 'Bài 11. Điện trở. Định luật Ohm'),
        l('sci9-c3-l12', 'Bài 12. Đoạn mạch nối tiếp, song song'),
        l('sci9-c3-l13', 'Bài 13. Năng lượng của dòng diện và công suất điện')
    ]},
    { id: 'sci9-c4', title: 'Chương 4: Điện từ', lessons: [
        l('sci9-c4-l14', 'Bài 14. Cảm ứng điện từ. Nguyên tắc tạo dòng diện xoay chiều'),
        l('sci9-c4-l15', 'Bài 15. Tác dụng của dòng diện xoay chiều')
    ]},
    { id: 'sci9-c5', title: 'Chương 5: Năng lượng với cuộc sống', lessons: [
        l('sci9-c5-l16', 'Bài 16. Vòng năng lượng trên Trái Đất. Năng lượng hoá thạch'),
        l('sci9-c5-l17', 'Bài 17. Một số dạng năng lượng tái tạo')
    ]},
    { id: 'sci9-c6', title: 'Chương 6: Kim loại', lessons: [
        l('sci9-c6-l18', 'Bài 18. Tính chất chung của kim loại'),
        l('sci9-c6-l19', 'Bài 19. Dãy hoạt động hoá học'),
        l('sci9-c6-l20', 'Bài 20. Tách kim loại và việc sử dụng hợp kim'),
        l('sci9-c6-l21', 'Bài 21. Sự khác nhau cơ bản giữa phi kim và kim loại')
    ]},
    { id: 'sci9-c7', title: 'Chương 7: Chất hữu cơ', lessons: [
        l('sci9-c7-l22', 'Bài 22. Giới thiệu về hợp chất hữu cơ'),
        l('sci9-c7-l23', 'Bài 23. Alkane'),
        l('sci9-c7-l24', 'Bài 24. Alkene'),
        l('sci9-c7-l25', 'Bài 25. Nguồn nhiên liệu')
    ]},
    { id: 'sci9-c8', title: 'Chương 8: Ethylic alcohol và Acetic acid', lessons: [
        l('sci9-c8-l26', 'Bài 26. Ethylic alcohol'),
        l('sci9-c8-l27', 'Bài 27. Acetic acid')
    ]},
    { id: 'sci9-c9', title: 'Chương 9: Lipid - Carbohydrate - Protein - Polymer', lessons: [
        l('sci9-c9-l28', 'Bài 28. Lipid'),
        l('sci9-c9-l29', 'Bài 29. Carbohydrate. Glucose và saccharose'),
        l('sci9-c9-l30', 'Bài 30. Tinh bột và cellulose'),
        l('sci9-c9-l31', 'Bài 31. Protein'),
        l('sci9-c9-l32', 'Bài 32. Polymer')
    ]},
    { id: 'sci9-c10', title: 'Chương 10: Khai thác tài nguyên từ vỏ Trái Đất', lessons: [
        l('sci9-c10-l33', 'Bài 33. Sơ lược về hoá học vỏ Trái Đất'),
        l('sci9-c10-l34', 'Bài 34. Khai thác đá vôi. Công nghiệp silicate'),
        l('sci9-c10-l35', 'Bài 35. Khai thác nhiên liệu hoá thạch. Chu trình carbon')
    ]},
    { id: 'sci9-c11', title: 'Chương 11: Di truyền học Mendel', lessons: [
        l('sci9-c11-l36', 'Bài 36. Khái quát về di truyền học'),
        l('sci9-c11-l37', 'Bài 37. Các quy luật di truyền của Mendel'),
        l('sci9-c11-l38', 'Bài 38. Nucleic acid và gene'),
        l('sci9-c11-l39', 'Bài 39. Tái bản DNA và phiên mã tạo RNA'),
        l('sci9-c11-l40', 'Bài 40. Dịch mã và mối quan hệ từ gene đến tính trạng'),
        l('sci9-c11-l41', 'Bài 41. Đột biến gene')
    ]},
    { id: 'sci9-c12', title: 'Chương 12: Di truyền nhiễm sắc thể', lessons: [
        l('sci9-c12-l42', 'Bài 42. Nhiễm sắc thể và bộ nhiễm sắc thể'),
        l('sci9-c12-l43', 'Bài 43. Nguyên phân và giảm phân'),
        l('sci9-c12-l44', 'Bài 44. Nhiễm sắc thể giới tính và cơ chế xác định giới tính'),
        l('sci9-c12-l45', 'Bài 45. Di truyền liên kết'),
        l('sci9-c12-l46', 'Bài 46. Đột biến nhiễm sắc thể')
    ]},
    { id: 'sci9-c13', title: 'Chương 13: Di truyền học với con người', lessons: [
        l('sci9-c13-l47', 'Bài 47. Di truyền học với con người'),
        l('sci9-c13-l48', 'Bài 48. Ứng dụng công nghệ di truyền vào đời sống')
    ]},
    { id: 'sci9-c14', title: 'Chương 14: Tiến hóa', lessons: [
        l('sci9-c14-l49', 'Bài 49. Khái niệm tiến hoá và các hình thức chọn lọc'),
        l('sci9-c14-l50', 'Bài 50. Cơ chế tiến hoá'),
        l('sci9-c14-l51', 'Bài 51. Sự phát sinh và phát triển sự sống trên Trái Đất')
    ]}
  ]
};

// =============================================================================
// PHẦN 5: LỊCH SỬ & ĐỊA LÍ (KẾT NỐI TRI THỨC) - CẬP NHẬT 6 (7,8,9 GIỮ NGUYÊN)
// =============================================================================

const HG_6_COURSE_DATA: Course = {
  id: 'hg-6', subjectName: 'LS & ĐL', gradeLevel: 6, title: 'Kết nối tri thức',
  chapters: [
    { id: 'hg6-ls-c1', title: 'LỊCH SỬ - CHƯƠNG 1. VÌ SAO PHẢI HỌC LỊCH SỬ?', lessons: [
        l('hg6-ls-c1-l1', 'Bài 1. Lịch sử và cuộc sống'),
        l('hg6-ls-c1-l2', 'Bài 2. Dựa vào đâu để biết và phục dựng lại lịch sử?'),
        l('hg6-ls-c1-l3', 'Bài 3. Thời gian trong lịch sử')
    ]},
    { id: 'hg6-ls-c2', title: 'LỊCH SỬ - CHƯƠNG 2. XÃ HỘI NGUYÊN THUỶ', lessons: [
        l('hg6-ls-c2-l4', 'Bài 4. Nguồn gốc loài người'),
        l('hg6-ls-c2-l5', 'Bài 5. Xã hội nguyên thuỷ'),
        l('hg6-ls-c2-l6', 'Bài 6. Sự chuyển biển và phân hoá của xã hội nguyên thuỷ')
    ]},
    { id: 'hg6-ls-c3', title: 'LỊCH SỬ - CHƯƠNG 3. XÃ HỘI CỔ ĐẠI', lessons: [
        l('hg6-ls-c3-l7', 'Bài 7. Ai Cập và Lưỡng Hà cổ đại'),
        l('hg6-ls-c3-l8', 'Bài 8. Ấn Độ cổ đại'),
        l('hg6-ls-c3-l9', 'Bài 9. Trung Quốc từ thời cổ đại đến thế kỉ VII'),
        l('hg6-ls-c3-l10', 'Bài 10. Hy Lạp và La Mã cổ đại')
    ]},
    { id: 'hg6-ls-c4', title: 'LỊCH SỬ - CHƯƠNG 4. ĐÔNG NAM Á TỪ ĐẦU CÔNG NGUYÊN ĐẾN TK X', lessons: [
        l('hg6-ls-c4-l11', 'Bài 11. Các quốc gia sơ kì ở Đông Nam Á'),
        l('hg6-ls-c4-l12', 'Bài 12. Sự hình thành các vương quốc phong kiến ở Đông Nam Á'),
        l('hg6-ls-c4-l13', 'Bài 13. Giao lưu văn hoá ở Đông Nam Á')
    ]},
    { id: 'hg6-ls-c5', title: 'LỊCH SỬ - CHƯƠNG 5. VIỆT NAM TỪ TK VII TCN ĐẾN ĐẦU TK X', lessons: [
        l('hg6-ls-c5-l14', 'Bài 14. Nhà nước Văn Lang – Âu Lạc'),
        l('hg6-ls-c5-l15', 'Bài 15. Chính sách cai trị của PK phương Bắc và sự chuyển biến của Âu Lạc'),
        l('hg6-ls-c5-l16', 'Bài 16. Các cuộc khởi nghĩa tiêu biểu giành độc lập trước thế kỉ X'),
        l('hg6-ls-c5-l17', 'Bài 17. Cuộc đấu tranh bảo tồn và phát triển văn hoá dân tộc'),
        l('hg6-ls-c5-l18', 'Bài 18. Bước ngoặt lịch sử đầu thế kỉ X'),
        l('hg6-ls-c5-l19', 'Bài 19. Vương quốc Chăm-pa từ thế kỉ II đến thế kỉ X'),
        l('hg6-ls-c5-l20', 'Bài 20. Vương quốc Phù Nam')
    ]},
    { id: 'hg6-dl-c1', title: 'ĐỊA LÍ - BÀI MỞ ĐẦU & CHƯƠNG 1. BẢN ĐỒ', lessons: [
        l('hg6-dl-c1-l1', 'Bài 1. Hệ thống kinh, vĩ tuyến. Tọa độ địa lí'),
        l('hg6-dl-c1-l2', 'Bài 2. Bản đồ. Một số lưới kinh, vĩ tuyến. Phương hướng'),
        l('hg6-dl-c1-l3', 'Bài 3. Tỉ lệ bản đồ. Tính khoảng cách thực tế'),
        l('hg6-dl-c1-l4', 'Bài 4. Kí hiệu và bảng chú giải bản đồ. Tìm đường đi'),
        l('hg6-dl-c1-l5', 'Bài 5. Lược đồ trí nhớ')
    ]},
    { id: 'hg6-dl-c2', title: 'ĐỊA LÍ - CHƯƠNG 2. TRÁI ĐẤT', lessons: [
        l('hg6-dl-c2-l6', 'Bài 6. Trái Đất trong hệ Mặt Trời'),
        l('hg6-dl-c2-l7', 'Bài 7. Chuyển động tự quay quanh trục của Trái Đất và hệ quả'),
        l('hg6-dl-c2-l8', 'Bài 8. Chuyển động của Trái Đất quanh Mặt Trời và hệ quả'),
        l('hg6-dl-c2-l9', 'Bài 9. Xác định phương hướng ngoài thực tế')
    ]},
    { id: 'hg6-dl-c3', title: 'ĐỊA LÍ - CHƯƠNG 3. CẤU TẠO CỦA TRÁI ĐẤT', lessons: [
        l('hg6-dl-c3-l10', 'Bài 10. Cấu tạo của Trái Đất. Các mảng kiến tạo'),
        l('hg6-dl-c3-l11', 'Bài 11. Quá trình nội sinh và ngoại sinh. Hiện tượng tạo núi'),
        l('hg6-dl-c3-l12', 'Bài 12. Núi lửa và động đất'),
        l('hg6-dl-c3-l13', 'Bài 13. Các dạng địa hình chính trên Trái Đất. Khoáng sản'),
        l('hg6-dl-c3-l14', 'Bài 14. Thực hành: Đọc lược đồ địa hình')
    ]},
    { id: 'hg6-dl-c4', title: 'ĐỊA LÍ - CHƯƠNG 4. KHÍ HẬU VÀ BIẾN ĐỔI KHÍ HẬU', lessons: [
        l('hg6-dl-c4-l15', 'Bài 15. Lớp vỏ khí của Trái Đất. Khí áp và gió'),
        l('hg6-dl-c4-l16', 'Bài 16. Nhiệt độ không khí. Mây và mưa'),
        l('hg6-dl-c4-l17', 'Bài 17. Thời tiết và khí hậu. Biến đổi khí hậu'),
        l('hg6-dl-c4-l18', 'Bài 18. Thực hành: Phân tích biểu đồ nhiệt độ, lượng mưa')
    ]},
    { id: 'hg6-dl-c5', title: 'ĐỊA LÍ - CHƯƠNG 5. NƯỚC TRÊN TRÁI ĐẤT', lessons: [
        l('hg6-dl-c5-l19', 'Bài 19. Thuỷ quyển và vòng tuần hoàn lớn của nước'),
        l('hg6-dl-c5-l20', 'Bài 20. Sông và hồ. Nước ngầm và băng hà'),
        l('hg6-dl-c5-l21', 'Bài 21. Biển và đại dương')
    ]},
    { id: 'hg6-dl-c6', title: 'ĐỊA LÍ - CHƯƠNG 6. ĐẤT VÀ SINH VẬT', lessons: [
        l('hg6-dl-c6-l22', 'Bài 22. Lớp đất trên Trái Đất'),
        l('hg6-dl-c6-l23', 'Bài 23. Sự sống trên Trái Đất'),
        l('hg6-dl-c6-l24', 'Bài 24. Rừng nhiệt đới'),
        l('hg6-dl-c6-l25', 'Bài 25. Sự phân bố các đới thiên nhiên trên Trái Đất'),
        l('hg6-dl-c6-l26', 'Bài 26. Thực hành: Tìm hiểu môi trường tự nhiên địa phương')
    ]},
    { id: 'hg6-dl-c7', title: 'ĐỊA LÍ - CHƯƠNG 7. CON NGƯỜI VÀ THIÊN NHIÊN', lessons: [
        l('hg6-dl-c7-l27', 'Bài 27. Dân số và sự phân bố dân cư trên thế giới'),
        l('hg6-dl-c7-l28', 'Bài 28. Mối quan hệ giữa con người và thiên nhiên'),
        l('hg6-dl-c7-l29', 'Bài 29. Bảo vệ tự nhiên và khai thác thông minh tài nguyên'),
        l('hg6-dl-c7-l30', 'Bài 30. Thực hành: Tìm hiểu mối quan hệ con người và thiên nhiên')
    ]}
  ]
};

const HG_7_COURSE_DATA: Course = {
  id: 'hg-7', subjectName: 'LS & ĐL', gradeLevel: 7, title: 'Kết nối tri thức',
  chapters: [
    { id: 'hg7-ls-c1', title: 'LỊCH SỬ - Chương 1: Tây Âu từ TK V đến nửa đầu TK XVI', lessons: [
        l('hg7-ls-c1-l1', 'Bài 1. Quá trình hình thành và phát triển chế độ phong kiến Tây Âu'),
        l('hg7-ls-c1-l2', 'Bài 2. Các cuộc phát kiến địa lí')
    ]},
    { id: 'hg7-dl-c1', title: 'ĐỊA LÍ - Chương 1: Châu Âu', lessons: [
        l('hg7-dl-c1-l1', 'Bài 1. Vị trí địa lí, đặc điểm tự nhiên Châu Âu'),
        l('hg7-dl-c1-l2', 'Bài 2. Đặc điểm dân cư, xã hội Châu Âu')
    ]}
  ]
};

const HG_8_COURSE_DATA: Course = {
  id: 'hg-8', subjectName: 'LS & ĐL', gradeLevel: 8, title: 'Kết nối tri thức',
  chapters: [
    { id: 'hg8-ls-c1', title: 'LỊCH SỬ - Chương 1: Châu Âu và Bắc Mỹ (Nửa sau TK XVI - XVIII)', lessons: [
        l('hg8-ls-c1-l1', 'Bài 1. Cách mạng tư sản Anh và chiến tranh giành độc lập ở Bắc Mỹ'),
        l('hg8-ls-c1-l2', 'Bài 2. Cách mạng tư sản Pháp cuối thế kỉ XVIII')
    ]},
    { id: 'hg8-dl-c1', title: 'ĐỊA LÍ - Chương 1: Vị trí địa lí và phạm vi lãnh thổ Việt Nam', lessons: [
        l('hg8-dl-c1-l1', 'Bài 1. Vị trí địa lí và phạm vi lãnh thổ Việt Nam'),
        l('hg8-dl-c1-l2', 'Bài 2. Địa hình Việt Nam')
    ]}
  ]
};

const HG_9_COURSE_DATA: Course = {
  id: 'hg-9', subjectName: 'LS & ĐL', gradeLevel: 9, title: 'Kết nối tri thức',
  chapters: [
    { id: 'hg9-ls-c1', title: 'LỊCH SỬ - Chương 1: Thế giới từ năm 1918 đến năm 1945', lessons: [
        l('hg9-ls-c1-l1', 'Bài 1. Nước Nga và Liên Xô từ năm 1918 đến năm 1945'),
        l('hg9-ls-c1-l2', 'Bài 2. Châu Âu và nước Mỹ từ năm 1918 đến năm 1929')
    ]},
    { id: 'hg9-dl-c1', title: 'ĐỊA LÍ - Chương 1: Địa lí dân cư Việt Nam', lessons: [
        l('hg9-dl-c1-l1', 'Bài 1. Dân tộc và dân số'),
        l('hg9-dl-c1-l2', 'Bài 2. Phân bố dân cư và các loại hình quần cư'),
        l('hg9-dl-c1-l3', 'Bài 3. Thực hành: Phân tích sự phân bố dân cư')
    ]}
  ]
};

// --- EXPORT ---

export const ALL_COURSES: Record<string, Course> = {
  'math-6': MATH_6_COURSE_DATA,
  'math-7': MATH_7_COURSE_DATA,
  'math-8': MATH_8_COURSE_DATA,
  'math-9': MATH_9_COURSE_DATA,
  
  'lit-6': LIT_6_COURSE_DATA,
  'lit-7': LIT_7_COURSE_DATA,
  'lit-8': LIT_8_COURSE_DATA,
  'lit-9': LIT_9_COURSE_DATA,
  
  'eng-6': ENG_6_COURSE_DATA,
  'eng-7': ENG_7_COURSE_DATA,
  'eng-8': ENG_8_COURSE_DATA,
  'eng-9': ENG_9_COURSE_DATA,
  
  'sci-6': SCI_6_COURSE_DATA,
  'sci-7': SCI_7_COURSE_DATA,
  'sci-8': SCI_8_COURSE_DATA,
  'sci-9': SCI_9_COURSE_DATA,
  
  'hg-6': HG_6_COURSE_DATA,
  'hg-7': HG_7_COURSE_DATA,
  'hg-8': HG_8_COURSE_DATA,
  'hg-9': HG_9_COURSE_DATA,
};

const generatePracticeLessons = (course: Course): PracticeChapter[] => {
    return (course.chapters || []).map(chapter => ({
        id: `sp-${chapter.id}`,
        title: chapter.title,
        lessons: (chapter.lessons || []).map(lesson => ({ id: `sp-${lesson.id}`, title: lesson.title })),
    }));
};

export const PRACTICE_LESSONS_DATA: Record<string, PracticeChapter[]> = {
    'sp-math-grade-6': generatePracticeLessons(MATH_6_COURSE_DATA),
    'sp-math-grade-7': generatePracticeLessons(MATH_7_COURSE_DATA),
    'sp-math-grade-8': generatePracticeLessons(MATH_8_COURSE_DATA),
    'sp-math-grade-9': generatePracticeLessons(MATH_9_COURSE_DATA),
    
    'sp-literature-grade-6': generatePracticeLessons(LIT_6_COURSE_DATA),
    'sp-literature-grade-7': generatePracticeLessons(LIT_7_COURSE_DATA),
    'sp-literature-grade-8': generatePracticeLessons(LIT_8_COURSE_DATA),
    'sp-literature-grade-9': generatePracticeLessons(LIT_9_COURSE_DATA),
    
    'sp-english-grade-6': generatePracticeLessons(ENG_6_COURSE_DATA),
    'sp-english-grade-7': generatePracticeLessons(ENG_7_COURSE_DATA),
    'sp-english-grade-8': generatePracticeLessons(ENG_8_COURSE_DATA),
    'sp-english-grade-9': generatePracticeLessons(ENG_9_COURSE_DATA),
    
    'sp-science-grade-6': generatePracticeLessons(SCI_6_COURSE_DATA),
    'sp-science-grade-7': generatePracticeLessons(SCI_7_COURSE_DATA),
    'sp-science-grade-8': generatePracticeLessons(SCI_8_COURSE_DATA),
    'sp-science-grade-9': generatePracticeLessons(SCI_9_COURSE_DATA),
    
    'sp-history-geo-grade-6': generatePracticeLessons(HG_6_COURSE_DATA),
    'sp-history-geo-grade-7': generatePracticeLessons(HG_7_COURSE_DATA),
    'sp-history-geo-grade-8': generatePracticeLessons(HG_8_COURSE_DATA),
    'sp-history-geo-grade-9': generatePracticeLessons(HG_9_COURSE_DATA),
};

export const LESSON_LOOKUP_MAP: Record<string, LessonLookupInfo> = {};
Object.values(ALL_COURSES).forEach(course => {
    const gradeName = `Lớp ${course.gradeLevel}`;
    (course.chapters || []).forEach(chapter => {
        (chapter.lessons || []).forEach(lesson => {
            LESSON_LOOKUP_MAP[lesson.id] = { title: lesson.title, courseId: course.id, gradeName, subjectName: course.subjectName };
        });
    });
});
