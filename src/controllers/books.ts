import { Request, Response } from "express";
import { validationResult, Result, ValidationError } from "express-validator";

import Book, { TBook } from "../models/book.js";
import checkValidationResult from "../util/checkValidationError.js";

// GET /books --> Get All books
export function getIndex(req: Request, res: Response) {
  Book.findAll()
    .then((books: Array<TBook>) => {
      res.status(200).json({ message: "Operation Success", data: books });
    })
    .catch((error: Error) => {
      res
        .status(500)
        .json({ error: error.message || "Error Fetching All Books" });
    });
}

// POST /books --> create a new book
export function postIndex(req: Request, res: Response) {
  const name: String = req.body.name;
  const author: String = req.body.author;
  const isbn: Number = req.body.isbn;
  const errors: Result<ValidationError> = validationResult(req);
  const checkError = checkValidationResult(errors);

  if (checkError) {
    return res.status(422).json(checkError);
  }

  Book.create({
    name: name,
    author: author,
    isbn: isbn,
  })
    .then(() => {
      console.log("Successfully Added Book!");
      res.status(201).json({ message: "Book added successfully" });
    })
    .catch((error: Error) => {
      res.status(500).json({ error: error.message || "Error creating Book!" });
    });
}

// GET /books/:bookId --> Get a book by id
export function getBook(req: Request, res: Response) {
  const bookId: Number = req.params.bookId;
  const errors: Result<ValidationError> = validationResult(req);
  const checkError = checkValidationResult(errors);

  if (checkError) {
    return res.status(422).json(checkError);
  }

  Book.findByPk(bookId)
    .then((book: TBook) => {
      if (book) {
        res.status(200).json({ message: "Operation Success", data: book });
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    })
    .catch((error: Error) => {
      res.status(500).json({ error: error.message || "Error Fetching Book" });
    });
}

// PUT /books/:bookId --> Update Book by id
export function putUpdateBook(req: Request, res: Response) {
  const updatedBook: TBook = req.body;
  const bookId: Number = req.params.bookId;
  const errors: Result<ValidationError> = validationResult(req);
  const checkError = checkValidationResult(errors);

  if (checkError) {
    return res.status(422).json(checkError);
  }

  if (!updatedBook || Object.keys(req.body).length == 0) {
    return res.status(422).json({ message: "Request Body is not Valid" });
  }

  Book.findByPk(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Book not found!" });
      } else {
        Book.update(updatedBook, { where: { id: bookId } }).then(() => {
          console.log("Successfully updated Book!");
          res.status(200).json({ message: "Book updated successfully" });
        });
      }
    })
    .catch((error: Error) => {
      res.status(500).json({ error: error.message || "Error updating Book!" });
    });
}

// DELETE /books/:bookId --> Delete Book by id
export function deleteBook(req: Request, res: Response) {
  const bookId: Number = req.params.bookId;

  const errors: Result<ValidationError> = validationResult(req);
  const checkError = checkValidationResult(errors);

  if (checkError) {
    return res.status(422).json(checkError);
  }

  Book.findByPk(bookId)
    .then((book) => {
      if (!book) return res.status(404).json({ message: "Book not found!" });
      return book.destroy();
    })
    .then(() => {
      console.log("Delete product successfully");
      return res.status(200).json({ message: "Book Deleted successfully" });
    })
    .catch((error: Error) => {
      res.status(500).json({
        error: error.message || "Error Occurred While Deleting Book!",
      });
    });
}

// POST /rent-book --> Rent a Book
// export function rentBook(req: Request, res: Response) {
//   try {
//     const bookName: string = req.body.name;
//     if (!bookName) {
//       throw new Error("Book name missing for rent");
//     }
//     Book.findAll().then((books) => {
//       let foundBook: boolean = false;
//       books.forEach((book) => {
//         if (book.name.toLowerCase() === bookName.toLowerCase()) {
//           book.rented = true;
//           foundBook = true;
//         }
//       });
//       if (foundBook) {
//         res.status(200).send("Book Rented Successfully");
//       } else {
//         res.status(404).send("Desired book not found");
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

// GET /search?search="str" --> Get books that match the search
export function searchBooks(req: Request, res: Response) {
  try {
    const searchQuery: string = req.query.search;
    if (!searchQuery) {
      throw new Error("Search query is missing");
    }
    Book.findAll()
      .then((books: Array<TBook>) => {
        const filteredBooks = books.filter((book) => {
          return book.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
        res
          .status(200)
          .json({ message: "Operation Success", data: filteredBooks });
      })
      .catch((error: Error) => {
        res
          .status(500)
          .json({ error: error.message || "Error Fetching All Books" });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
