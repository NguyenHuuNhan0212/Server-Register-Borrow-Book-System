// // chatbot.service.js - Phiên bản hoàn chỉnh có lưu ngữ cảnh (context) và hỗ trợ trả lời theo câu trước

// const { OpenAI } = require("openai");
// const Sach = require("../models/sach.model");
// const TacGia = require("../models/tacgia.model");
// const NhaXuatBan = require("../models/nhaxuatban.model");
// const SachCopy = require("../models/sachCopy.model");
// const LoaiSach = require("../models/loaisach.model");
// const ChatLog = require("../models/chatlog.model");
// require("dotenv").config();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const sessions = {};

// const normalize = (str) =>
//   (str || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// function detectIntent(message, authors, publishers, types) {
//   const norm = normalize(message);
//   const isAskingQuantity =
//     /bao nhieu|tổng số|tong so|so luong|co bao nhieu|co may|bao nhiu/.test(
//       norm
//     );

//   const matchedAuthor = authors.find((a) => norm.includes(normalize(a.TenTG)));
//   const matchedPublisher = publishers.find((p) =>
//     norm.includes(normalize(p.TenNXB))
//   );
//   const matchedType = types.find((t) =>
//     norm.includes(normalize(t.TenLoai || ""))
//   );

//   const isAskingTotalBooks = isAskingQuantity && /sach|sách/.test(norm);
//   const isAskingTotalTypes = isAskingQuantity && /loai|thể loại/.test(norm);
//   const isAskingTotalAuthors = isAskingQuantity && /tac gia|tác giả/.test(norm);
//   const isAskingAuthorList =
//     /thong tin.*tac gia|danh sach.*tac gia|tac gia.*nao|cac tac gia/i.test(
//       norm
//     );

//   return {
//     isAskingQuantity,
//     isAskingTotalBooks,
//     isAskingTotalTypes,
//     isAskingTotalAuthors,
//     isAskingAuthorList,
//     matchedAuthor,
//     matchedPublisher,
//     matchedType,
//   };
// }

// async function saveAndReturnReply(MaDocGia, userMessage, reply, context = {}) {
//   const prev = sessions[MaDocGia] || {};
//   const history = prev.history || [];
//   history.push({ role: "user", content: userMessage });
//   history.push({ role: "assistant", content: reply });

//   sessions[MaDocGia] = {
//     history,
//     context: { ...prev.context, ...context },
//   };

//   await ChatLog.create({ MaDocGia, question: userMessage, answer: reply });
//   return reply;
// }

// class ChatbotService {
//   static async getResponse(message, MaDocGia) {
//     const userMessage = message.trim();
//     const prevSession = sessions[MaDocGia] || {};
//     const history = prevSession.history || [];
//     let context = prevSession.context || {};

//     if (/^(xin chào|chào|hello|hi|chao|hey)/i.test(userMessage)) {
//       const reply =
//         "👋 Xin chào! Bạn muốn hỏi gì về sách, tác giả hay thư viện? Tôi luôn sẵn sàng giúp đỡ.";
//       return await saveAndReturnReply(MaDocGia, userMessage, reply);
//     }

//     const [allBooks, allAuthors, allPublishers, allTypes] = await Promise.all([
//       Sach.find({}, "_id TenSach TacGia MaLoai NamXuatBan"),
//       TacGia.find({}, "_id TenTG"),
//       NhaXuatBan.find({}, "_id TenNXB DiaChi"),
//       LoaiSach.find({}, "_id TenLoai"),
//     ]);

//     let {
//       isAskingQuantity,
//       isAskingTotalBooks,
//       isAskingTotalTypes,
//       isAskingTotalAuthors,
//       isAskingAuthorList,
//       matchedAuthor,
//       matchedPublisher,
//       matchedType,
//     } = detectIntent(userMessage, allAuthors, allPublishers, allTypes);

//     if (!matchedAuthor && context.matchedAuthor)
//       matchedAuthor = context.matchedAuthor;
//     if (!matchedPublisher && context.matchedPublisher)
//       matchedPublisher = context.matchedPublisher;
//     if (!matchedType && context.matchedType) matchedType = context.matchedType;

//     const normMsg = normalize(userMessage);
//     let matchedBookTitles = allBooks
//       .map((b) => b.TenSach)
//       .filter((title) => normMsg.includes(normalize(title)));

//     if (matchedBookTitles.length === 0 && context.matchedBookTitles) {
//       matchedBookTitles = context.matchedBookTitles;
//     }

//     if (/ten (la|là) gi/i.test(userMessage) && history.length >= 2) {
//       const lastUserMsg = history[history.length - 2]?.content || "";
//       if (/bao nhieu (sach|sách)/i.test(normalize(lastUserMsg))) {
//         const tenSach = allBooks.map((b) => b.TenSach).slice(0, 5);
//         const reply =
//           tenSach.length > 0
//             ? `📘 Một vài đầu sách trong thư viện gồm:\n- ${tenSach.join(
//                 "\n- "
//               )}`
//             : "📘 Hiện tại thư viện chưa có đầu sách nào.";
//         return await saveAndReturnReply(MaDocGia, userMessage, reply);
//       }
//     }

//     if (/(\bcòn\b.*sách|\bsách\b.*\bcòn\b)/.test(normMsg)) {
//       const authorContext = matchedAuthor || context.matchedAuthor;
//       if (authorContext) {
//         const count = await Sach.countDocuments({ TacGia: authorContext._id });
//         const reply = count
//           ? `📘 Tác giả **${authorContext.TenTG}** còn khoảng **${count} đầu sách** trong thư viện.`
//           : `📘 Hiện tại không còn sách nào của tác giả **${authorContext.TenTG}** trong thư viện.`;
//         return await saveAndReturnReply(MaDocGia, userMessage, reply, {
//           matchedAuthor: authorContext,
//         });
//       }
//     }

//     if (isAskingQuantity && matchedBookTitles.length > 0) {
//       const matchedBooks = await Sach.find({
//         TenSach: { $in: matchedBookTitles },
//       });
//       const bookIds = matchedBooks.map((b) => b._id);
//       const copies = await SachCopy.find({ MaSach: { $in: bookIds } });
//       const totalCopies = copies.reduce((sum, c) => sum + (c.SoQuyen || 0), 0);

//       const reply = `📘 Trong thư viện có khoảng **${totalCopies} quyển sách** thuộc "${matchedBookTitles.join(
//         ", "
//       )}".`;
//       return await saveAndReturnReply(MaDocGia, userMessage, reply, {
//         matchedBookTitles,
//       });
//     }

//     if (isAskingTotalBooks) {
//       const count = await Sach.countDocuments({});
//       const reply = `📚 Thư viện hiện có tổng cộng khoảng **${count} đầu sách** khác nhau.`;
//       return await saveAndReturnReply(MaDocGia, userMessage, reply);
//     }

//     if (isAskingTotalAuthors) {
//       const reply = `✍️ Thư viện hiện có khoảng **${allAuthors.length} tác giả** khác nhau.`;
//       return await saveAndReturnReply(MaDocGia, userMessage, reply);
//     }

//     if (isAskingAuthorList) {
//       const names = allAuthors.map((a, i) => `${i + 1}. ${a.TenTG}`).join("\n");
//       const reply = `📖 Danh sách các tác giả trong thư viện:\n${names}`;
//       return await saveAndReturnReply(MaDocGia, userMessage, reply);
//     }

//     if (isAskingQuantity && matchedAuthor) {
//       const count = await Sach.countDocuments({ TacGia: matchedAuthor._id });
//       const reply = `📘 Tác giả **${matchedAuthor.TenTG}** có khoảng **${count} đầu sách** trong thư viện.`;
//       return await saveAndReturnReply(MaDocGia, userMessage, reply, {
//         matchedAuthor,
//       });
//     }

//     const query = {};
//     if (matchedBookTitles.length) query.TenSach = { $in: matchedBookTitles };
//     else if (matchedAuthor) query.TacGia = matchedAuthor._id;

//     const books = await Sach.find(query)
//       .limit(5)
//       .populate("TacGia")
//       .populate("MaLoai");
//     const bookIds = books.map((b) => b._id);
//     const copies = await SachCopy.find({ MaSach: { $in: bookIds } }).populate(
//       "MaViTri"
//     );

//     let sachText = books.length
//       ? books
//           .map((book) => {
//             const relatedCopies = copies.filter((c) =>
//               c.MaSach.equals(book._id)
//             );
//             const tacgia = Array.isArray(book.TacGia)
//               ? book.TacGia.map((t) => t.TenTG).join(", ")
//               : book.TacGia?.TenTG || "Không rõ";

//             const copyText = relatedCopies
//               .map(
//                 (c) =>
//                   `- ${c.TenLoaiBanSao} (${c.SoQuyen - c.SoLuongDaMuon}/${
//                     c.SoQuyen
//                   })`
//               )
//               .join("\n");

//             return `📘 \"${book.TenSach}\"\nTác giả: ${tacgia}\n${copyText}`;
//           })
//           .join("\n\n---\n\n")
//       : "🤖 Không tìm thấy sách phù hợp với yêu cầu của bạn.";

//     const messages = [
//       {
//         role: "system",
//         content:
//           "Bạn là trợ lý thư viện. Trả lời chính xác theo dữ liệu, không bịa đặt.",
//       },
//       { role: "system", content: `Dữ liệu sách:\n${sachText}` },
//       ...history.slice(-5),
//       { role: "user", content: userMessage },
//     ];

//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages,
//     });

//     const reply =
//       completion.choices?.[0]?.message?.content ||
//       "🤖 Xin lỗi, tôi không thể phản hồi lúc này.";

//     return await saveAndReturnReply(MaDocGia, userMessage, reply, {
//       matchedAuthor,
//       matchedPublisher,
//       matchedType,
//       matchedBookTitles: matchedBookTitles.length
//         ? matchedBookTitles
//         : undefined,
//     });
//   }
// }
const { OpenAI } = require("openai");
const Sach = require("../models/sach.model");
const TacGia = require("../models/tacgia.model");
const ChatLog = require("../models/chatlog.model");
const SachCopy = require("../models/sachCopy.model");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const sessions = {};

async function analyzeIntent(userMessage) {
  const messages = [
    {
      role: "system",
      content: `Bạn là trình phân tích câu hỏi về thư viện.
Ví dụ:
- "Trong thư viện có bao nhiêu sách?" → intent: "hoi_soluong_sach"
- "Tác giả Nguyễn Nhật Ánh có sách không?" → intent: "hoi_sach_cua_tac_gia"
- "Sách đó còn không?" → intent: "hoi_sach_con_khong"
- "Tôi muốn tìm sách thiếu nhi" → intent: "tim_sach", category: "thiếu nhi"
- "Ai là tác giả cuốn Lược sử thời gian?" → intent: "hoi_tac_gia"`,
    },
    { role: "user", content: userMessage },
  ];

  const functions = [
    {
      name: "extract_info",
      parameters: {
        type: "object",
        properties: {
          intent: {
            type: "string",
            description:
              "tim_sach, hoi_sach_cua_tac_gia, hoi_tac_gia, hoi_soluong_sach, hoi_sach_con_khong, hoi_the_loai, hoi_nxb, hoi_gioi_thieu, khac",
          },
          bookTitle: { type: "string" },
          author: { type: "string" },
          publisher: { type: "string" },
          category: { type: "string" },
          followUp: { type: "boolean" },
        },
      },
    },
  ];

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    functions,
    function_call: { name: "extract_info" },
  });

  try {
    return JSON.parse(res.choices[0].message.function_call.arguments);
  } catch (e) {
    return { intent: "khac" };
  }
}

async function saveReply(MaDocGia, userMessage, reply, context = {}) {
  const prev = sessions[MaDocGia] || {};
  const history = prev.history || [];

  history.push({ role: "user", content: userMessage });
  history.push({ role: "assistant", content: reply });

  sessions[MaDocGia] = {
    history,
    context: { ...prev.context, ...context },
  };

  await ChatLog.create({ MaDocGia, question: userMessage, answer: reply });
  return reply;
}

class ChatbotService {
  static async getResponse(message, MaDocGia) {
    const userMessage = message.trim();
    const prevSession = sessions[MaDocGia] || {};
    const history = prevSession.history || [];
    let context = prevSession.context || {};

    if (/^(hi|chào|hello|hey|xin chào)/i.test(userMessage)) {
      const reply =
        "👋 Xin chào! Bạn muốn hỏi gì về sách, tác giả hay thư viện? Tôi sẵn sàng hỗ trợ.";
      return await saveReply(MaDocGia, userMessage, reply);
    }

    const { intent, bookTitle, author, publisher, category } =
      await analyzeIntent(userMessage);

    const matchedBookTitle = bookTitle || context.bookTitle || "";
    const matchedAuthor = author || context.author || "";

    // 1. Tổng số đầu sách
    if (intent === "hoi_soluong_sach") {
      const count = await Sach.countDocuments({});
      const reply = `📚 Thư viện hiện có khoảng **${count} đầu sách** khác nhau.`;
      return await saveReply(MaDocGia, userMessage, reply, context);
    }

    // 2. Tìm sách theo thể loại
    if (intent === "tim_sach" && category) {
      const books = await Sach.find({
        MoTa: { $regex: category, $options: "i" },
      }).limit(10);

      if (!books.length) {
        return await saveReply(
          MaDocGia,
          userMessage,
          `📚 Không tìm thấy sách phù hợp với thể loại "${category}".`,
          context
        );
      }

      const bookIds = books.map((b) => b._id);
      const copies = await SachCopy.find({ MaSach: { $in: bookIds } });

      const reply =
        `📚 Một số sách thuộc chủ đề "${category}":\n\n` +
        books
          .map((b, i) => {
            const related = copies.filter((c) => c.MaSach.equals(b._id));
            const total = related.reduce((sum, c) => sum + c.SoQuyen, 0);
            const borrowed = related.reduce(
              (sum, c) => sum + c.SoLuongDaMuon,
              0
            );
            const available = total - borrowed;
            return `${i + 1}. ${b.TenSach} – 📚 Còn: ${available}/${total}`;
          })
          .join("\n");

      return await saveReply(MaDocGia, userMessage, reply, {
        ...context,
        category,
      });
    }

    // 3. Sách của tác giả (kèm số lượng còn lại)
    if (
      intent === "hoi_sach_cua_tac_gia" ||
      (intent === "tim_sach" && author)
    ) {
      const tacGia = await TacGia.findOne({
        TenTG: { $regex: matchedAuthor, $options: "i" },
      });

      if (!tacGia) {
        return await saveReply(
          MaDocGia,
          userMessage,
          `❌ Không tìm thấy tác giả "${matchedAuthor}".`,
          context
        );
      }

      const books = await Sach.find({ TacGia: tacGia._id }).limit(10);
      if (!books.length) {
        return await saveReply(
          MaDocGia,
          userMessage,
          `🤖 Tác giả "${matchedAuthor}" hiện chưa có sách trong thư viện.`,
          context
        );
      }

      const bookIds = books.map((b) => b._id);
      const copies = await SachCopy.find({ MaSach: { $in: bookIds } });

      const reply =
        `📚 Một số sách của tác giả **${matchedAuthor}**:\n\n` +
        books
          .map((book, i) => {
            const related = copies.filter((c) => c.MaSach.equals(book._id));
            const total = related.reduce((sum, c) => sum + c.SoQuyen, 0);
            const borrowed = related.reduce(
              (sum, c) => sum + c.SoLuongDaMuon,
              0
            );
            const available = total - borrowed;
            return `${i + 1}. ${book.TenSach} – 📚 Còn: ${available}/${total}`;
          })
          .join("\n");

      return await saveReply(MaDocGia, userMessage, reply, {
        ...context,
        author: matchedAuthor,
        authorId: tacGia._id,
      });
    }

    // 4. Ai là tác giả cuốn X
    if (intent === "hoi_tac_gia" && matchedBookTitle) {
      const book = await Sach.findOne({
        TenSach: { $regex: matchedBookTitle, $options: "i" },
      }).populate("TacGia");

      if (!book) {
        return await saveReply(
          MaDocGia,
          userMessage,
          `📕 Không tìm thấy cuốn sách "${matchedBookTitle}".`,
          context
        );
      }

      const tenTG =
        typeof book.TacGia === "object" && book.TacGia.TenTG
          ? book.TacGia.TenTG
          : book.TacGia;

      const reply = `✍️ Cuốn "${book.TenSach}" được viết bởi **${tenTG}**.`;
      return await saveReply(MaDocGia, userMessage, reply, {
        bookTitle: book.TenSach,
        author: tenTG,
      });
    }

    // 5. Sách đó còn không?
    if (intent === "hoi_sach_con_khong" && matchedBookTitle) {
      const book = await Sach.findOne({
        TenSach: { $regex: matchedBookTitle, $options: "i" },
      });

      if (!book) {
        return await saveReply(
          MaDocGia,
          userMessage,
          `📕 Không tìm thấy cuốn sách "${matchedBookTitle}".`,
          context
        );
      }

      const reply =
        book.TinhTrang === "het"
          ? `📕 Cuốn "${book.TenSach}" hiện **không còn** trong thư viện.`
          : `📗 Cuốn "${book.TenSach}" vẫn còn trong thư viện.`;

      return await saveReply(MaDocGia, userMessage, reply, context);
    }

    // Fallback GPT khi không hiểu intent
    if (intent === "khac") {
      return await saveReply(
        MaDocGia,
        userMessage,
        "🤖 Xin lỗi, tôi chưa hiểu rõ câu hỏi. Bạn có thể hỏi lại rõ hơn không?",
        context
      );
    }

    // GPT fallback
    const fallback = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Bạn là trợ lý thư viện, chỉ trả lời theo dữ liệu.",
        },
        ...history.slice(-6),
        { role: "user", content: userMessage },
      ],
    });

    const reply =
      fallback.choices?.[0]?.message?.content ||
      "🤖 Xin lỗi, tôi không thể phản hồi lúc này.";

    return await saveReply(MaDocGia, userMessage, reply, context);
  }
}

module.exports = ChatbotService;
