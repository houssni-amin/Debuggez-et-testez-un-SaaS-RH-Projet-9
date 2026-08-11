/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		test("Then if I upload a file that is not a jpg, jpeg or png, it should be rejected", () => {
			// Affichage de la page
			const html = NewBillUI()
			document.body.innerHTML = html

			// Ciblage de l'input d'upload
			const fileInput = screen.getByTestId("file")

			// Ajout de la logique js
			new NewBill({
				document,
				onNavigate: () => {},
				store: null,
				localStorage: window.localStorage,
			})

			// Simule l'alerte pour ne pas bloquer le test et éviter l'erreur console
			jest.spyOn(window, "alert").mockImplementation(() => {})

			// Création d'un mauvais fichier
			const wrongFile = new File(["hello"], "document.pdf", {
				type: "application/pdf",
			})

			// Simulation de l'ajout du fichier
			fireEvent.change(fileInput, { target: { files: [wrongFile] } })

			// Vérification : le fichier est rejeté, le champ est vidé
			expect(fileInput.value).toBe("")
		})
	})
})
