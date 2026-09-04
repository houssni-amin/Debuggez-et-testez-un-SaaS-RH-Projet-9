/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"

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

		test("Then it should post the new bill to the mock API", async () => {
			// Génération de l'interface utilisateur de la page NewBill
			document.body.innerHTML = NewBillUI()

			// Surveillance de la fonction de navigation
			const onNavigate = jest.fn()
			// Surveillance de la méthode de mise à jour de l'API
			const update = jest.fn().mockResolvedValue({})

			// Configuration du faux store avec la méthode update mockée
			const mockStore = {
				bills: () => ({
					update,
				}),
			}

			// Simulation d'un utilisateur connecté (Employé) dans le stockage local
			localStorage.setItem(
				"user",
				JSON.stringify({ type: "Employee", email: "a@a" }),
			)

			// Initialisation du contrôleur de la page NewBill
			new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			})

			// Ciblage du formulaire dans le DOM
			const form = screen.getByTestId("form-new-bill")
			// Soumission du formulaire
			fireEvent.submit(form)

			// Vérification : Confirmation que la méthode update de l'API a bien été appelée
			expect(update).toHaveBeenCalled()
			// Vérification : Confirmation que l'app a bien navigué vers la route "Bills"
			expect(onNavigate).toBeCalledWith(ROUTES_PATH.Bills)
		})
	})
})
