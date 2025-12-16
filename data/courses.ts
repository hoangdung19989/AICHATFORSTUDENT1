
// FIX: Corrected import path for types
import type { Course, Grade, PracticeChapter, LessonLookupInfo } from '../types/index';

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


// --- START OF ALL COURSE DATA ---

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
          videoUrl: 'https://vcos.cloudstorage.com.vn/1-bucket-1111/Gi%E1%BA%A3i_M%C3%A3_Nh%E1%BB%AFng_Con_S%E1%BB%91.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=atm305057-s3user%2F20251205%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251205T175759Z&X-Amz-Expires=518341&X-Amz-Signature=3ab78c41dcc650f0fac6e34bf289c332b08822ce26323bc9de61c29b20116a27&X-Amz-SignedHeaders=host'
        },
        {
          id: 'm6-c1-l3',
          title: 'Bài 3. Thứ tự trong tập hợp các số tự nhiên.',
          type: 'video',
          videoUrl: 'https://vcos.cloudstorage.com.vn/1-bucket-1111/Th%E1%BB%A9_T%E1%BB%B1_C%C3%A1c_S%E1%BB%91_T%E1%BB%B1_Nhi%C3%AAn.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=atm305057-s3user%2F20251205%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251205T175729Z&X-Amz-Expires=518370&X-Amz-Signature=b48895172b1ed75ba75b16d76fc3561f1134e302b0b5d15a99f1abf860829377&X-Amz-SignedHeaders=host'
        },
        {
          id: 'm6-c1-l4',
          title: 'Bài 4. Phép cộng và phép trừ số tự nhiên.',
          type: 'video',
          videoUrl: 'https://vcos.cloudstorage.com.vn/1-bucket-1111/Ph%C3%A9p_C%E1%BB%99ng_%26_Tr%E1%BB%AB_S%E1%BB%91_T%E1%BB%B1_Nhi%C3%AAn.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=atm305057-s3user%2F20251205%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251205T175830Z&X-Amz-Expires=518369&X-Amz-Signature=80ae1411a28f12cf4801c1dbdb94d7c6aa10f686f61f1b8e98e46455365c7a50&X-Amz-SignedHeaders=host'
        },
        {
          id: 'm6-c1-l5',
          title: 'Bài 5. Phép nhân và phép chia số tự nhiên.',
          type: 'video',
          videoUrl: 'https://vcos.cloudstorage.com.vn/1-bucket-1111/B%C3%A0i_5__Ph%C3%A9p_nh%C3%A2n_v%C3%A0_Ph%C3%A9p_chia.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=atm305057-s3user%2F20251205%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251205T175853Z&X-Amz-Expires=518346&X-Amz-Signature=a5eb4145da16701db9e6e52de337545c3224974108b2eb039a1760ceee6ed97c&X-Amz-SignedHeaders=host'
        },
        {
          id: 'm6-c1-l6',
          title: 'Bài 6. Luỹ thừa với số mũ tự nhiên.',
          type: 'video',
          videoUrl: 'https://vcos.cloudstorage.com.vn/1-bucket-1111/L%C5%A9y_th%E1%BB%ABa_v%E1%BB%9Bi_S%E1%BB%91_m%C5%A9_T%E1%BB%B1_nhi%C3%AAn.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=atm305057-s3user%2F20251205%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251205T175920Z&X-Amz-Expires=518379&X-Amz-Signature=eac4341d18d4fb430d3ed0de8db61ecd3c7c409446855d681e3a4ffd36e3855a&X-Amz-SignedHeaders=host'
        },
        {
          id: 'm6-c1-l7',
          title: 'Bài 7. Thứ tự thực hiện các phép tính.',
          type: 'video',
          videoUrl: 'https://vcos.cloudstorage.com.vn/1-bucket-1111/TH%E1%BB%A8_T%E1%BB%B0_TH%E1%BB%B0C_HI%E1%BB%86N_C%C3%81C_PH%C3%89P_T%C3%8DNH.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=atm305057-s3user%2F20251205%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251205T175944Z&X-Amz-Expires=518355&X-Amz-Signature=d2f94c39af968ae06435a61485069e23962cba249d7508d3d5630d25713fbee8&X-Amz-SignedHeaders=host'
        },
      ]
    },
    {
      id: 'm6-c2',
      title: 'CHƯƠNG II. TÍNH CHIA HẾT TRONG TẬP HỢP CÁC SỐ TỰ NHIÊN.',
      lessons: [
        { id: 'm6-c2-l8', title: 'Bài 8. Quan hệ chia hết và tính chất.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c2-l9', title: 'Bài 9. Dấu hiệu chia hết.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c2-l10', title: 'Bài 10. Số nguyên tố.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c2-l11', title: 'Bài 11. Ước chung. Ước chung lớn nhất.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c2-l12', title: 'Bài 12. Bội chung. Bội chung nhỏ nhất.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm6-c3',
      title: 'CHƯƠNG III. SỐ NGUYÊN.',
      lessons: [
        { id: 'm6-c3-l13', title: 'Bài 13. Tập hợp các số nguyên.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c3-l14', title: 'Bài 14. Phép cộng và phép trừ số nguyên.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c3-l15', title: 'Bài 15. Quy tắc dấu ngoặc.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c3-l16', title: 'Bài 16. Phép nhân số nguyên.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c3-l17', title: 'Bài 17. Phép chia hết. Ước và bội của một số nguyên.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm6-c4',
      title: 'CHƯƠNG IV. MỘT SỐ HÌNH PHẲNG TRONG THỰC TIỄN.',
      lessons: [
        { id: 'm6-c4-l18', title: 'Bài 18. Hình tam giác đều. Hình vuông. Hình lục giác đều.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c4-l19', title: 'Bài 19. Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c4-l20', title: 'Bài 20. Chu vi và diện tích của một số tứ giác đã học.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm6-c5',
      title: 'CHƯƠNG V. TÍNH ĐỐI XỨNG CỦA HÌNH PHẲNG TRONG TỰ NHIÊN.',
      lessons: [
        { id: 'm6-c5-l21', title: 'Bài 21. Hình có trục đối xứng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c5-l22', title: 'Bài 22. Hình có tâm đối xứng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm6-c6',
      title: 'CHƯƠNG VI. PHÂN SỐ.',
      lessons: [
        { id: 'm6-c6-l23', title: 'Bài 23. Mở rộng phân số. Phân số bằng nhau.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c6-l24', title: 'Bài 24. So sánh phân số. Hỗn số dương.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c6-l25', title: 'Bài 25. Phép cộng và phép trừ phân số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c6-l26', title: 'Bài 26. Phép nhân và phép chia phân số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c6-l27', title: 'Bài 27. Hai bài toán về phân số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm6-c7',
      title: 'CHƯƠNG VII. SỐ THẬP PHÂN.',
      lessons: [
        { id: 'm6-c7-l28', title: 'Bài 28. Số thập phân.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c7-l29', title: 'Bài 29. Tính toán với số thập phân.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c7-l30', title: 'Bài 30. Làm tròn và ước lượng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c7-l31', title: 'Bài 31. Một số bài toán về tỉ số và tỉ số phần trăm.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm6-c8',
      title: 'CHƯƠNG VIII. NHỮNG HÌNH HÌNH HỌC CƠ BẢN.',
      lessons: [
        { id: 'm6-c8-l32', title: 'Bài 32. Điểm và đường thẳng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c8-l33', title: 'Bài 33. Điểm nằm giữa hai điểm. Tia.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c8-l34', title: 'Bài 34. Đoạn thẳng. Độ dài đoạn thẳng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c8-l35', title: 'Bài 35. Trung điểm của đoạn thẳng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c8-l36', title: 'Bài 36. Góc.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c8-l37', title: 'Bài 37. Số đo góc.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm6-c9',
      title: 'CHƯƠNG IX. DỮ LIỆU VÀ XÁC SUẤT THỰC NGHIỆM.',
      lessons: [
        { id: 'm6-c9-l38', title: 'Bài 38. Dữ liệu và thu thập dữ liệu.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c9-l39', title: 'Bài 39. Bảng thống kê và biểu đồ tranh.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c9-l40', title: 'Bài 40. Biểu đồ cột.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c9-l41', title: 'Bài 41. Biểu đồ cột kép.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c9-l42', title: 'Bài 42. Kết quả có thể và sự kiện trong trò chơi, thí nghiệm.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm6-c9-l43', title: 'Bài 43. Xác suất thực nghiệm.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
  ]
};

const MATH_7_COURSE_DATA: Course = {
  id: 'math-7',
  subjectName: 'Toán',
  gradeLevel: 7,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'm7-c1',
      title: 'Chương I. SỐ HỮU TỈ.',
      lessons: [
        { id: 'm7-c1-l1', title: 'Bài 1. Tập hợp các số hữu tỉ.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c1-l2', title: 'Bài 2. Cộng, trừ, nhân, chia số hữu tỉ.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c1-l3', title: 'Bài 3. Luỹ thừa với số mũ tự nhiên của một số hữu tỉ.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c1-l4', title: 'Bài 4. Thứ tự thực hiện các phép tính. Quy tắc chuyển vế.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm7-c2',
      title: 'Chương II. SỐ THỰC.',
      lessons: [
        { id: 'm7-c2-l5', title: 'Bài 5. Làm quen với số thập phân vô hạn tuần hoàn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c2-l6', title: 'Bài 6. Số vô tỉ. Căn bậc hai số học.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c2-l7', title: 'Bài 7. Tập hợp các số thực.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm7-c3',
      title: 'Chương III. GÓC VÀ ĐƯỜNG THẲNG SONG SONG.',
      lessons: [
        { id: 'm7-c3-l8', title: 'Bài 8. Góc ở vị trí đặc biệt. Tia phân giác của một góc.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c3-l9', title: 'Bài 9. Hai đường thẳng song song và dấu hiệu nhận biết.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c3-l10', title: 'Bài 10. Tiên đề Euclid. Tính chất của hai đường thẳng song song.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c3-l11', title: 'Bài 11. Định lí và chứng minh định lí.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm7-c4',
      title: 'Chương IV. TAM GIÁC BẰNG NHAU.',
      lessons: [
        { id: 'm7-c4-l12', title: 'Bài 12. Tổng các góc trong một tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c4-l13', title: 'Bài 13. Hai tam giác bằng nhau. Trường hợp bằng nhau thứ nhất của tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c4-l14', title: 'Bài 14. Trường hợp bằng nhau thứ hai và thứ ba của tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c4-l15', title: 'Bài 15. Các trường hợp bằng nhau của tam giác vuông.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c4-l16', title: 'Bài 16. Tam giác cân. Đường trung trực của đoạn thẳng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm7-c5',
      title: 'Chương V. THU THẬP VÀ BIỂU DIỄN DỮ LIỆU.',
      lessons: [
        { id: 'm7-c5-l17', title: 'Bài 17. Thu thập và phân loại dữ liệu.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c5-l18', title: 'Bài 18. Biểu đồ hình quạt tròn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c5-l19', title: 'Bài 19. Biểu đồ đoạn thẳng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm7-c6',
      title: 'Chương VI. TỈ LỆ THỨC VÀ ĐẠI LƯỢNG TỈ LỆ.',
      lessons: [
        { id: 'm7-c6-l20', title: 'Bài 20. Tỉ lệ thức.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c6-l21', title: 'Bài 21. Tính chất của dãy tỉ số bằng nhau.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c6-l22', title: 'Bài 22. Đại lượng tỉ lệ thuận.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c6-l23', title: 'Bài 23. Đại lượng tỉ lệ nghịch.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm7-c7',
      title: 'Chương VII. BIỂU THỨC ĐẠI SỐ VÀ ĐA THỨC MỘT BIẾN.',
      lessons: [
        { id: 'm7-c7-l24', title: 'Bài 24. Biểu thức đại số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c7-l25', title: 'Bài 25. Đa thức một biến.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c7-l26', title: 'Bài 26. Phép cộng và phép trừ đa thức một biến.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c7-l27', title: 'Bài 27. Phép nhân đa thức một biến.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c7-l28', title: 'Bài 28. Phép chia đa thức một biến.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm7-c8',
      title: 'Chương VIII. LÀM QUEN VỚI BIẾN CỐ VÀ XÁC SUẤT CỦA BIẾN CỐ.',
      lessons: [
        { id: 'm7-c8-l29', title: 'Bài 29. Làm quen với biến cố.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c8-l30', title: 'Bài 30. Làm quen với xác suất của biến cố.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm7-c9',
      title: 'Chương IX. QUAN HỆ GIỮA CÁC YẾU TỐ TRONG MỘT TAM GIÁC.',
      lessons: [
        { id: 'm7-c9-l31', title: 'Bài 31. Quan hệ giữa góc và cạnh đối diện trong một tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c9-l32', title: 'Bài 32. Quan hệ giữa đường vuông góc và đường xiên.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c9-l33', title: 'Bài 33. Quan hệ giữa ba cạnh của một tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c9-l34', title: 'Bài 34. Sự đồng quy của ba trung tuyến, ba đường phân giác trong một tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c9-l35', title: 'Bài 35. Sự đồng quy của ba đường trung trực, ba đường cao trong một tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm7-c10',
      title: 'Chương X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN.',
      lessons: [
        { id: 'm7-c10-l36', title: 'Bài 36. Hình hộp chữ nhật và hình lập phương.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c10-l37', title: 'Luyện tập.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm7-c10-l38', title: 'Bài 37. Hình lăng trụ đứng tam giác và hình lăng trụ đứng tứ giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
  ]
};

const MATH_8_COURSE_DATA: Course = {
  id: 'math-8',
  subjectName: 'Toán',
  gradeLevel: 8,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'm8-c1',
      title: 'Chương I. ĐA THỨC.',
      lessons: [
        { id: 'm8-c1-l1', title: 'Bài 1. Đơn thức.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c1-l2', title: 'Bài 2. Đa thức.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c1-l3', title: 'Bài 3. Phép cộng và phép trừ đa thức.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c1-l4', title: 'Bài 4. Phép nhân đa thức.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c1-l5', title: 'Bài 5. Phép chia đa thức cho đơn thức.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm8-c2',
      title: 'Chương II. HẰNG ĐẲNG THỨC ĐÁNG NHỚ VÀ ỨNG DỤNG.',
      lessons: [
        { id: 'm8-c2-l6', title: 'Bài 6. Hiệu hai bình phương. Bình phương của một tổng hay một hiệu.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c2-l7', title: 'Bài 7. Lập phương của một tổng hay một hiệu.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c2-l8', title: 'Bài 8. Tổng và hiệu hai lập hương.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c2-l9', title: 'Bài 9. Phân tích đa thức thành nhân tử.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm8-c3',
      title: 'Chương III. TỨ GIÁC.',
      lessons: [
        { id: 'm8-c3-l10', title: 'Bài 10. Tứ giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c3-l11', title: 'Bài 11. Hình thang cân.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c3-l12', title: 'Bài 12. Hình bình hành.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c3-l13', title: 'Bài 13. Hình chữ nhật.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c3-l14', title: 'Bài 14. Hình thoi và hình vuông.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm8-c4',
      title: 'CHƯƠNG IV. ĐỊNH LÍ THALES.',
      lessons: [
        { id: 'm8-c4-l15', title: 'Bài 15. Định lí Thalès trong tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c4-l16', title: 'Bài 16. Đường trung bình của tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c4-l17', title: 'Bài 17. Tính chất đường phân giác của tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm8-c5',
      title: 'Chương V. DỮ LIỆU VÀ BIỂU ĐỒ.',
      lessons: [
        { id: 'm8-c5-l18', title: 'Bài 18. Thu thập và phân loại dữ liệu.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c5-l19', title: 'Bài 19. Biểu diễn dữ liệu bằng bảng, biểu đồ.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c5-l20', title: 'Bài 20. Phân tích số liệu thống kê dựa vào biểu đó.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm8-c6',
      title: 'Chương VI. PHÂN THỨC ĐẠI SỐ.',
      lessons: [
        { id: 'm8-c6-l21', title: 'Bài 21. Phần thức đại số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c6-l22', title: 'Bài 22. Tính chất cơ bản của phân thức đại số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c6-l23', title: 'Bài 23. Phép cộng và phép trừ phân thức đại số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c6-l24', title: 'Bài 24. Phép nhân và phép chia phân thức đại số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm8-c7',
      title: 'Chương VII. PHƯƠNG TRÌNH BẬC NHẤT VÀ HÀM SỐ BẬC NHẤT.',
      lessons: [
        { id: 'm8-c7-l25', title: 'Bài 25. Phương trình bậc nhất một ẩn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c7-l26', title: 'Bài 26. Giải bài toán bằng cách lập phương trình.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c7-l27', title: 'Bài 27. Khái niệm hàm số và đô thị của hàm số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c7-l28', title: 'Bài 28. Hàm số bậc nhất và đô thị của hàm số bậc nhất.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c7-l29', title: 'Bài 29. Hệ số góc của đường thẳng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm8-c8',
      title: 'Chương VIII. MỞ ĐẦU VỀ TÍNH XÁC SUẤT CỦA BIẾN CỐ.',
      lessons: [
        { id: 'm8-c8-l30', title: 'Bài 30. Kết quả có thể và kết quả thuận lợi.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c8-l31', title: 'Bài 31. Cách tính xác suất của biến cố bằng tỉ số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c8-l32', title: 'Bài 32. Mối liên hệ giữa xác suất thực nghiệm với xác suất và ứng dụng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm8-c9',
      title: 'Chương IX. TAM GIÁC ĐỒNG DẠNG.',
      lessons: [
        { id: 'm8-c9-l33', title: 'Bài 33. Hai tam giác đồng dạng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c9-l34', title: 'Bài 34. Ba trường hợp đồng dạng của hai tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c9-l35', title: 'Bài 35. Định lí Pythagore và ứng dụng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c9-l36', title: 'Bài 36. Các trường hợp đồng dạng của hai tam giác vuông.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c9-l37', title: 'Bài 37. Hình đồng dạng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm8-c10',
      title: 'Chương X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN.',
      lessons: [
        { id: 'm8-c10-l38', title: 'Bài 38. Hình chóp tam giác đều.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm8-c10-l39', title: 'Bài 39. Hình chóp tứ giác đều.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
  ]
};

const MATH_9_COURSE_DATA: Course = {
  id: 'math-9',
  subjectName: 'Toán',
  gradeLevel: 9,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'm9-c1',
      title: 'Chương I. PHƯƠNG TRÌNH VÀ HỆ HAI PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN.',
      lessons: [
        { id: 'm9-c1-l1', title: 'Bài 1. Khái niệm phương trình và hệ hai phương trình bậc nhất hai ẩn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c1-l2', title: 'Bài 2. Giải hệ hai phương trình bậc nhất hai ẩn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c1-l3', title: 'Bài 3. Giải bài toán bằng cách lập hệ phương trình.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm9-c2',
      title: 'Chương II. PHƯƠNG TRÌNH VÀ BẤT PHƯƠNG TRÌNH BẬC NHẤT MỘT ẨN.',
      lessons: [
        { id: 'm9-c2-l4', title: 'Bài 4. Phương trình quy về phương trình bậc nhất một ẩn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c2-l5', title: 'Bài 5. Bất đẳng thức và tính chất.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c2-l6', title: 'Bài 6. Bất phương trình bậc nhất một ẩn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c2-l7', title: 'Bài tập cuối chương II.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm9-c3',
      title: 'Chương III. CĂN BẬC HAI VÀ CĂN BẬC BA.',
      lessons: [
        { id: 'm9-c3-l7', title: 'Bài 7. Căn bậc hai và căn thức bậc hai.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c3-l8', title: 'Bài 8. Khai căn bậc hai với phép nhân và phép chia.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c3-l9', title: 'Bài 9. Biến đổi đơn giản và rút gọn biểu thức chứa căn thức bậc hai.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c3-l10', title: 'Bài 10. Căn bậc ba và căn thức bậc ba.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm9-c4',
      title: 'Chương IV. HỆ THỨC LƯỢNG TRONG TAM GIÁC VUÔNG.',
      lessons: [
        { id: 'm9-c4-l11', title: 'Bài 11. Tỉ số lượng giác của góc nhọn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c4-l12', title: 'Bài 12. Một số hệ thức giữa cạnh, góc trong tam giác vuông và ứng dụng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm9-c5',
      title: 'Chương V. ĐƯỜNG TRÒN.',
      lessons: [
        { id: 'm9-c5-l13', title: 'Bài 13. Mở đầu về đường tròn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c5-l14', title: 'Bài 14. Cung và dây của một đường tròn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c5-l15', title: 'Bài 15. Độ dài của cung tròn. Diện tích hình quạt tròn và hình vành khuyên.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c5-l16', title: 'Bài 16. Vị trí tương đối của đường thẳng và đường tròn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c5-l17', title: 'Bài 17. Vị trí tương đối của hai đường tròn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm9-c6',
      title: 'Chương VI. HÀM SỐ y = ax2 (a khác 0). PHƯƠNG TRÌNH BẬC HAI MỘT ẨN.',
      lessons: [
        { id: 'm9-c6-l18', title: 'Bài 18. Hàm số y = ax2 (a ≠ 0).', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c6-l19', title: 'Bài 19. Phương trình bậc hai một ẩn.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c6-l20', title: 'Bài 20. Định lí Viète và ứng dụng.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c6-l21', title: 'Bài 21. Giải bài toán bằng cách lập phương trình.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm9-c7',
      title: 'Chương VII. TẦN SỐ VÀ TẦN SỐ TƯƠNG ĐỐI.',
      lessons: [
        { id: 'm9-c7-l22', title: 'Bài 22. Bảng tần số và biểu đồ tần số.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c7-l23', title: 'Bài 23. Bảng tần số tương đối và biểu đồ tần số tương đối.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c7-l24', title: 'Bài 24. Bảng tần số, tần số tương đối ghép nhóm và biểu đồ.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c7-l25', title: 'Bài tập cuối chương VII.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm9-c8',
      title: 'Chương VIII. XÁC SUẤT CỦA BIẾN CỐ TRONG MỘT SỐ MÔ HÌNH XÁC SUẤT ĐƠN GIẢN.',
      lessons: [
        { id: 'm9-c8-l25', title: 'Bài 25. Phép thử ngẫu nhiên và không gian mẫu.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c8-l26', title: 'Bài 26. Xác suất của biến cố liên quan tới phép thử.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm9-c9',
      title: 'Chương IX. ĐƯỜNG TRÒN NGOẠI TIẾP VÀ ĐƯỜNG TRÒN NỘI TIẾP.',
      lessons: [
        { id: 'm9-c9-l27', title: 'Bài 27. Góc nội tiếp.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c9-l28', title: 'Bài 28. Đường tròn ngoại tiếp và đường tròn nội tiếp của một tam giác.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c9-l29', title: 'Bài 29. Tứ giác nội tiếp.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c9-l30', title: 'Bài 30. Đa giác đều.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
    {
      id: 'm9-c10',
      title: 'Chương X. MỘT SỐ HÌNH KHỐI TRONG THỰC TIỄN.',
      lessons: [
        { id: 'm9-c10-l31', title: 'Bài 31. Hình trụ và hình nón.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'm9-c10-l32', title: 'Bài 32. Hình cầu.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
      ]
    },
  ]
};

const LIT_6_COURSE_DATA: Course = {
  id: 'lit-6',
  subjectName: 'Ngữ văn',
  gradeLevel: 6,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'lit6-c1',
      title: 'Bài 1: Tôi và các bạn',
      lessons: [
        { id: 'lit6-l1', title: 'Bài học đường đời đầu tiên', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const LIT_7_COURSE_DATA: Course = {
  id: 'lit-7',
  subjectName: 'Ngữ văn',
  gradeLevel: 7,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'lit7-c1',
      title: 'Bài 1: Bầu trời tuổi thơ',
      lessons: [
        { id: 'lit7-l1', title: 'Bầy chim chìa vôi', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const LIT_8_COURSE_DATA: Course = {
  id: 'lit-8',
  subjectName: 'Ngữ văn',
  gradeLevel: 8,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'lit8-c1',
      title: 'Bài 1: Câu chuyện của lịch sử',
      lessons: [
        { id: 'lit8-l1', title: 'Lá cờ thêu sáu chữ vàng', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const LIT_9_COURSE_DATA: Course = {
  id: 'lit-9',
  subjectName: 'Ngữ văn',
  gradeLevel: 9,
  title: 'Ngữ văn 9',
  chapters: [
    {
      id: 'lit9-c1',
      title: 'Bài 1: Phong cách Hồ Chí Minh',
      lessons: [
        { id: 'lit9-l1', title: 'Phong cách Hồ Chí Minh', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const ENG_6_COURSE_DATA: Course = {
  id: 'eng-6',
  subjectName: 'Tiếng Anh',
  gradeLevel: 6,
  title: 'Global Success',
  chapters: [
    {
      id: 'eng6-c1',
      title: 'Unit 1: My New School',
      lessons: [
        { id: 'eng6-l1', title: 'Getting Started', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const ENG_7_COURSE_DATA: Course = {
  id: 'eng-7',
  subjectName: 'Tiếng Anh',
  gradeLevel: 7,
  title: 'Global Success',
  chapters: [
    {
      id: 'eng7-c1',
      title: 'Unit 1: Hobbies',
      lessons: [
        { id: 'eng7-l1', title: 'Getting Started', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const ENG_8_COURSE_DATA: Course = {
  id: 'eng-8',
  subjectName: 'Tiếng Anh',
  gradeLevel: 8,
  title: 'Global Success',
  chapters: [
    {
      id: 'eng8-c1',
      title: 'Unit 1: Leisure Time',
      lessons: [
        { id: 'eng8-l1', title: 'Getting Started', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const ENG_9_COURSE_DATA: Course = {
  id: 'eng-9',
  subjectName: 'Tiếng Anh',
  gradeLevel: 9,
  title: 'Global Success',
  chapters: [
    {
      id: 'eng9-c1',
      title: 'Unit 1: Local Environment',
      lessons: [
        { id: 'eng9-l1', title: 'Getting Started', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const SCI_6_COURSE_DATA: Course = {
  id: 'sci-6',
  subjectName: 'KHTN',
  gradeLevel: 6,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'sci6-c1',
      title: 'Chủ đề 1: Mở đầu về Khoa học tự nhiên',
      lessons: [
        { id: 'sci6-l1', title: 'Giới thiệu về Khoa học tự nhiên', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const SCI_7_COURSE_DATA: Course = {
  id: 'sci-7',
  subjectName: 'KHTN',
  gradeLevel: 7,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'sci7-c1',
      title: 'Chủ đề 1: Nguyên tử',
      lessons: [
        { id: 'sci7-l1', title: 'Nguyên tử', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const SCI_8_COURSE_DATA: Course = {
  id: 'sci-8',
  subjectName: 'KHTN',
  gradeLevel: 8,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'sci8-c1',
      title: 'Chủ đề 1: Phản ứng hóa học',
      lessons: [
        { id: 'sci8-l1', title: 'Biến đổi chất', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const SCI_9_COURSE_DATA: Course = {
  id: 'sci-9',
  subjectName: 'KHTN',
  gradeLevel: 9,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'sci9-c1',
      title: 'Chủ đề 1: Năng lượng và sự biến đổi',
      lessons: [
        { id: 'sci9-l1', title: 'Năng lượng cơ học', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const HG_6_COURSE_DATA: Course = {
  id: 'hg-6',
  subjectName: 'LS & ĐL',
  gradeLevel: 6,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'hg6-h-c1',
      title: 'PHẦN LỊCH SỬ - CHƯƠNG 1. VÌ SAO PHẢI HỌC LỊCH SỬ?',
      lessons: [
        { id: 'hg6-h-c1-l1', title: 'Bài 1 Lịch sử và cuộc sống.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'hg6-h-c1-l2', title: 'Bài 2 Dựa vào đâu để biết và phục dựng lại lịch sử?', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' },
        { id: 'hg6-h-c1-l3', title: 'Bài 3 Thời gian trong lịch sử.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    },
    {
      id: 'hg6-g-c1',
      title: 'PHẦN ĐỊA LÍ - CHƯƠNG 1. BẢN ĐỒ',
      lessons: [
        { id: 'hg6-g-c1-l1', title: 'Bài 1 Hệ thống kinh, vĩ tuyến. Tọa độ địa lí.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const HG_7_COURSE_DATA: Course = {
  id: 'hg-7',
  subjectName: 'LS & ĐL',
  gradeLevel: 7,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'hg7-h-c1',
      title: 'PHẦN LỊCH SỬ - Chương 1. Tây Âu từ thế kỉ V đến nửa đầu thế kỉ XVI',
      lessons: [
        { id: 'hg7-h-c1-l1', title: 'Bài 1 Quá trình hình thành và phát triển của chế độ phong kiến ở Tây Âu', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    },
    {
      id: 'hg7-g-c1',
      title: 'PHẦN ĐỊA LÍ - Chương 1. Châu Âu',
      lessons: [
        { id: 'hg7-g-c1-l1', title: 'Bài 1 Vị trí địa lí, đặc điểm tự nhiên châu Âu', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const HG_8_COURSE_DATA: Course = {
  id: 'hg-8',
  subjectName: 'LS & ĐL',
  gradeLevel: 8,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'hg8-h-c1',
      title: 'PHẦN LỊCH SỬ - Chương 1. LỊCH SỬ THẾ GIỚI CẬN ĐẠI',
      lessons: [
        { id: 'hg8-h-c1-l1', title: 'Bài 1: Cách mạng tư sản Anh và Chiến tranh giành độc lập của 13 thuộc địa Anh ở Bắc Mĩ', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    },
    {
      id: 'hg8-g-c1',
      title: 'PHẦN ĐỊA LÍ - Chương 1. VỊ TRÍ ĐỊA LÍ, ĐỊA HÌNH VÀ KHOÁNG SẢN',
      lessons: [
        { id: 'hg8-g-c1-l1', title: 'Bài 1: Vị trí địa lí và phạm vi lãnh thổ Việt Nam', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

const HG_9_COURSE_DATA: Course = {
  id: 'hg-9',
  subjectName: 'LS & ĐL',
  gradeLevel: 9,
  title: 'Kết nối tri thức với cuộc sống',
  chapters: [
    {
      id: 'hg9-h-c1',
      title: 'PHẦN LỊCH SỬ - Chương 1: Thế giới từ năm 1918 đến năm 1945',
      lessons: [
        { id: 'hg9-h-c1-l1', title: 'Bài 1: Nước Nga và Liên Xô từ năm 1918 đến năm 1945', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    },
    {
      id: 'hg9-g-c1',
      title: 'PHẦN ĐỊA LÍ - Chương 1: Địa lý dân cư Việt Nam',
      lessons: [
        { id: 'hg9-g-c1-l1', title: 'Bài 1: Dân tộc và dân số', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example' }
      ]
    }
  ]
};

// --- END OF ALL COURSE DATA ---

export const ALL_COURSES: Record<string, Course> = {
  'math-6': MATH_6_COURSE_DATA, 'math-7': MATH_7_COURSE_DATA, 'math-8': MATH_8_COURSE_DATA, 'math-9': MATH_9_COURSE_DATA,
  'lit-6': LIT_6_COURSE_DATA, 'lit-7': LIT_7_COURSE_DATA, 'lit-8': LIT_8_COURSE_DATA, 'lit-9': LIT_9_COURSE_DATA,
  'eng-6': ENG_6_COURSE_DATA, 'eng-7': ENG_7_COURSE_DATA, 'eng-8': ENG_8_COURSE_DATA, 'eng-9': ENG_9_COURSE_DATA,
  'sci-6': SCI_6_COURSE_DATA, 'sci-7': SCI_7_COURSE_DATA, 'sci-8': SCI_8_COURSE_DATA, 'sci-9': SCI_9_COURSE_DATA,
  'hg-6': HG_6_COURSE_DATA, 'hg-7': HG_7_COURSE_DATA, 'hg-8': HG_8_COURSE_DATA, 'hg-9': HG_9_COURSE_DATA,
};

const generatePracticeLessons = (course: Course): PracticeChapter[] => {
    return course.chapters.map(chapter => ({
        id: `sp-${chapter.id}`,
        title: chapter.title,
        lessons: chapter.lessons.map(lesson => ({ id: `sp-${lesson.id}`, title: lesson.title })),
    }));
};

export const PRACTICE_LESSONS_DATA: Record<string, PracticeChapter[]> = {
    'sp-math-grade-6': generatePracticeLessons(MATH_6_COURSE_DATA), 'sp-math-grade-7': generatePracticeLessons(MATH_7_COURSE_DATA), 'sp-math-grade-8': generatePracticeLessons(MATH_8_COURSE_DATA), 'sp-math-grade-9': generatePracticeLessons(MATH_9_COURSE_DATA),
    'sp-literature-grade-6': generatePracticeLessons(LIT_6_COURSE_DATA), 'sp-literature-grade-7': generatePracticeLessons(LIT_7_COURSE_DATA), 'sp-literature-grade-8': generatePracticeLessons(LIT_8_COURSE_DATA), 'sp-literature-grade-9': generatePracticeLessons(LIT_9_COURSE_DATA),
    'sp-english-grade-6': generatePracticeLessons(ENG_6_COURSE_DATA), 'sp-english-grade-7': generatePracticeLessons(ENG_7_COURSE_DATA), 'sp-english-grade-8': generatePracticeLessons(ENG_8_COURSE_DATA), 'sp-english-grade-9': generatePracticeLessons(ENG_9_COURSE_DATA),
    'sp-science-grade-6': generatePracticeLessons(SCI_6_COURSE_DATA), 'sp-science-grade-7': generatePracticeLessons(SCI_7_COURSE_DATA), 'sp-science-grade-8': generatePracticeLessons(SCI_8_COURSE_DATA), 'sp-science-grade-9': generatePracticeLessons(SCI_9_COURSE_DATA),
    'sp-history-geo-grade-6': generatePracticeLessons(HG_6_COURSE_DATA), 'sp-history-geo-grade-7': generatePracticeLessons(HG_7_COURSE_DATA), 'sp-history-geo-grade-8': generatePracticeLessons(HG_8_COURSE_DATA), 'sp-history-geo-grade-9': generatePracticeLessons(HG_9_COURSE_DATA),
};

export const LESSON_LOOKUP_MAP: Record<string, LessonLookupInfo> = {};
Object.values(ALL_COURSES).forEach(course => {
    const gradeName = `Lớp ${course.gradeLevel}`;
    course.chapters.forEach(chapter => {
        chapter.lessons.forEach(lesson => {
            LESSON_LOOKUP_MAP[lesson.id] = { title: lesson.title, courseId: course.id, gradeName, subjectName: course.subjectName };
        });
    });
});
